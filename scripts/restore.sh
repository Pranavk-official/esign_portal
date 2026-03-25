#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
#  restore.sh — ASP eSign Gateway Frontend
#  Reverses the actions performed by deploy.sh
#
#  Usage:
#    ./scripts/restore.sh [OPTIONS]
#
#  Options:
#    -e, --env-file FILE    Path to .env file (default: .env)
#    --down                 Stop and remove containers (always implied by other flags)
#    --rm-images            Also remove all Docker images built by deploy.sh
#    --rm-certs             Also remove auto-generated TLS certificates
#    --git-reset            Also reset git to the state before the last pull
#    --full                 All of the above (--down + --rm-images + --rm-certs + --git-reset)
#    -y, --yes              Skip confirmation prompts
#    -h, --help             Show this help
#
#  What this script reverses:
#    deploy.sh action                       restore.sh reversal
#    ────────────────────────────────────── ─────────────────────────────────────
#    docker compose up (nginx + app)        docker compose down   (--down)
#    docker build / push                    docker rmi all tags   (--rm-images)
#    openssl cert generation                rm nginx/certs/*.{crt,key} (--rm-certs)
#    git pull --ff-only                     git reset --hard ORIG_HEAD (--git-reset)
#    .previous_image_tag state file         removed automatically in all modes
#
#  Notes:
#    - Images pruned by deploy.sh cannot be recovered (they were deleted).
#    - --rm-certs only removes the two files deploy.sh generates
#      (nginx/certs/esign.crt and nginx/certs/esign.key). Manually placed
#      certificates are NOT touched — back them up before using this flag.
#    - --git-reset uses ORIG_HEAD, which git sets after every 'git pull'.
#      It is only reliable before the next git fetch/pull/merge operation.
#    - Running without flags defaults to --down only.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Constants ──────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
PREVIOUS_TAG_FILE="$PROJECT_DIR/.previous_image_tag"
CERT_DIR="$PROJECT_DIR/nginx/certs"
CERT_FILE="$CERT_DIR/esign.crt"
KEY_FILE="$CERT_DIR/esign.key"

# ── Defaults ───────────────────────────────────────────────────────────────────
ENV_FILE="$PROJECT_DIR/.env"
DO_DOWN=false
DO_RM_IMAGES=false
DO_RM_CERTS=false
DO_GIT_RESET=false
AUTO_YES=false

# ── Colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log()     { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $*"; }
success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✓${NC} $*"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠${NC} $*"; }
error()   { echo -e "${RED}[$(date '+%H:%M:%S')] ✗${NC} $*" >&2; }
die()     { error "$*"; exit 1; }

confirm() {
  $AUTO_YES && return 0
  echo -en "${YELLOW}[$(date '+%H:%M:%S')] ?${NC} $* [y/N] "
  read -r reply
  [[ "${reply,,}" == "y" || "${reply,,}" == "yes" ]]
}

# ── Argument parsing ───────────────────────────────────────────────────────────
if [[ $# -eq 0 ]]; then
  warn "No action specified — defaulting to --down."
  warn "Run with -h to see all available restore options."
  DO_DOWN=true
fi

while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--env-file)  ENV_FILE="$2";      shift 2 ;;
    --down)         DO_DOWN=true;        shift   ;;
    --rm-images)    DO_DOWN=true; DO_RM_IMAGES=true; shift ;;
    --rm-certs)     DO_RM_CERTS=true;    shift   ;;
    --git-reset)    DO_GIT_RESET=true;   shift   ;;
    --full)
      DO_DOWN=true; DO_RM_IMAGES=true; DO_RM_CERTS=true; DO_GIT_RESET=true
      shift ;;
    -y|--yes)       AUTO_YES=true;       shift   ;;
    -h|--help)
      sed -n '/^#  Usage:/,/^# ──/p' "$0" | sed 's/^#  \?//'
      exit 0
      ;;
    *) die "Unknown option: $1. Run with -h for help." ;;
  esac
done

# ── Preflight ──────────────────────────────────────────────────────────────────
cd "$PROJECT_DIR"

log "${BOLD}ASP eSign Gateway — Restore Script${NC}"
log "Project dir : $PROJECT_DIR"
log "Env file    : $ENV_FILE"

[[ -f "$COMPOSE_FILE" ]] || die "docker-compose.yml not found at $COMPOSE_FILE"
command -v docker >/dev/null 2>&1 || die "docker is not installed"
docker compose version >/dev/null 2>&1 || die "docker compose (v2) is not available"

# Load env for IMAGE_NAME (soft — restore can run even without a .env)
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
else
  warn ".env file not found — IMAGE_NAME will default to 'esign-portal'"
fi
IMAGE_NAME="${IMAGE_NAME:-esign-portal}"

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Actions to perform:${NC}"
$DO_DOWN      && echo "  • Stop and remove all containers (docker compose down)"
$DO_RM_IMAGES && echo "  • Remove all '$IMAGE_NAME' Docker images"
$DO_RM_CERTS  && echo "  • Remove generated TLS certificates (nginx/certs/esign.{crt,key})"
$DO_GIT_RESET && echo "  • Reset git working tree to ORIG_HEAD (before last pull)"
echo "  • Remove .previous_image_tag state file (if present)"
echo ""
confirm "Proceed with restore?" || { log "Restore cancelled."; exit 0; }

# ── 1. Stop containers ─────────────────────────────────────────────────────────
if $DO_DOWN; then
  log "Stopping and removing containers…"
  if [[ -f "$ENV_FILE" ]]; then
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down --remove-orphans
  else
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
  fi
  success "Containers stopped and removed"
fi

# ── 2. Remove Docker images ───────────────────────────────────────────────────
if $DO_RM_IMAGES; then
  log "Removing Docker images for '$IMAGE_NAME'…"
  IMAGE_IDS=$(docker images "$IMAGE_NAME" --format "{{.ID}}" | sort -u)
  if [[ -n "$IMAGE_IDS" ]]; then
    echo "$IMAGE_IDS" | xargs docker rmi --force 2>/dev/null || true
    success "Docker images removed"
  else
    log "No images found for '$IMAGE_NAME' — nothing to remove"
  fi
fi

# ── 3. Remove generated TLS certificates ──────────────────────────────────────
if $DO_RM_CERTS; then
  log "Removing generated TLS certificates…"
  removed=false

  if [[ -f "$CERT_FILE" ]]; then
    # Warn if the cert looks like it may have been manually placed
    # (deploy.sh always embeds O=KSITM/OU=eSign; absence of that hint suggests manual)
    if command -v openssl >/dev/null 2>&1; then
      CERT_SUBJ=$(openssl x509 -noout -subject -in "$CERT_FILE" 2>/dev/null || echo "")
      if [[ "$CERT_SUBJ" != *"KSITM"* ]]; then
        warn "Certificate subject does not match the deploy.sh template (O=KSITM)."
        warn "This may be a manually managed certificate."
        confirm "Remove $CERT_FILE anyway?" || { log "Cert removal skipped"; DO_RM_CERTS=false; }
      fi
    fi

    if $DO_RM_CERTS; then
      rm -f "$CERT_FILE"
      log "  Removed: $CERT_FILE"
      removed=true
    fi
  fi

  if $DO_RM_CERTS && [[ -f "$KEY_FILE" ]]; then
    rm -f "$KEY_FILE"
    log "  Removed: $KEY_FILE"
    removed=true
  fi

  # Remove the certs directory only if it is now empty
  if [[ -d "$CERT_DIR" ]] && [[ -z "$(ls -A "$CERT_DIR" 2>/dev/null)" ]]; then
    rmdir "$CERT_DIR"
    log "  Removed empty directory: $CERT_DIR"
  fi

  $DO_RM_CERTS && {
    $removed && success "TLS certificates removed" || log "No certificate files found — nothing to remove"
  }
fi

# ── 4. Git reset ───────────────────────────────────────────────────────────────
if $DO_GIT_RESET; then
  if git rev-parse ORIG_HEAD >/dev/null 2>&1; then
    ORIG_SHORT=$(git rev-parse --short ORIG_HEAD)
    ORIG_FULL=$(git rev-parse ORIG_HEAD)
    warn "About to reset git working tree to ORIG_HEAD: $ORIG_SHORT ($ORIG_FULL)"
    warn "All local changes made after the last 'git pull' will be discarded."
    if confirm "Confirm git reset --hard ORIG_HEAD ($ORIG_SHORT)?"; then
      git reset --hard ORIG_HEAD
      success "Git reset to ORIG_HEAD: $ORIG_SHORT"
    else
      log "Git reset skipped"
    fi
  else
    warn "ORIG_HEAD not found — git pull may not have run, skipping git reset"
  fi
fi

# ── 5. Remove state file ──────────────────────────────────────────────────────
if [[ -f "$PREVIOUS_TAG_FILE" ]]; then
  rm -f "$PREVIOUS_TAG_FILE"
  log "Removed state file: $PREVIOUS_TAG_FILE"
fi

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
success "Restore complete"

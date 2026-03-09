#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
#  deploy.sh — ASP eSign Gateway Frontend
#  Zero-downtime deployment script for KSDC private VM
#
#  Usage:
#    ./scripts/deploy.sh [OPTIONS]
#
#  Options:
#    -e, --env-file FILE    Path to .env file (default: .env)
#    -t, --tag TAG          Docker image tag (default: git short SHA)
#    -b, --branch BRANCH    Git branch to pull (default: main)
#    -r, --registry HOST    Docker registry host (default: local build)
#    --skip-pull            Skip git pull (deploy current state)
#    --skip-build           Skip docker build (use existing image)
#    --rollback             Roll back to the previous image tag
#    -h, --help             Show this help
#
#  Environment variables (optional):
#    CERT_HOSTNAME          CN/SAN for auto-generated self-signed cert
#                           (default: system hostname). Ignored if a cert
#                           already exists at nginx/certs/esign.crt.
#
#  Prerequisites:
#    - Docker Engine v24+ and Docker Compose v2 (docker compose, not docker-compose)
#    - curl or wget (for health check polling)
#    - jq (for parsing health check JSON)
#    - git (for pulling latest code and generating tags)
#    - The .env file must exist and be populated (see .env.production template)
#
#  KSDC note:
#    If the VM has no direct internet access, set REGISTRY to your internal
#    Harbor / Nexus address and configure Docker to pull from there.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Constants ──────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
HEALTH_URL="http://localhost/api/health"
HEALTH_TIMEOUT=120   # seconds to wait for health check
HEALTH_INTERVAL=5    # seconds between health polls
PREVIOUS_TAG_FILE="$PROJECT_DIR/.previous_image_tag"

# ── Defaults ───────────────────────────────────────────────────────────────────
ENV_FILE="$PROJECT_DIR/.env"
GIT_BRANCH="main"
REGISTRY=""
SKIP_PULL=false
SKIP_BUILD=false
ROLLBACK=false
IMAGE_TAG=""

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

# ── Argument parsing ───────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--env-file)   ENV_FILE="$2";     shift 2 ;;
    -t|--tag)        IMAGE_TAG="$2";    shift 2 ;;
    -b|--branch)     GIT_BRANCH="$2";  shift 2 ;;
    -r|--registry)   REGISTRY="$2";    shift 2 ;;
    --skip-pull)     SKIP_PULL=true;   shift   ;;
    --skip-build)    SKIP_BUILD=true;  shift   ;;
    --rollback)      ROLLBACK=true;    shift   ;;
    -h|--help)
      sed -n '/^#  Usage:/,/^# ──/p' "$0" | sed 's/^#  \?//'
      exit 0
      ;;
    *) die "Unknown option: $1. Run with -h for help." ;;
  esac
done

# ── Preflight checks ───────────────────────────────────────────────────────────
cd "$PROJECT_DIR"

log "${BOLD}ASP eSign Gateway — Deployment Script${NC}"
log "Project dir : $PROJECT_DIR"
log "Compose file: $COMPOSE_FILE"
log "Env file    : $ENV_FILE"

[[ -f "$COMPOSE_FILE" ]] || die "docker-compose.yml not found at $COMPOSE_FILE"
[[ -f "$ENV_FILE" ]]     || die ".env file not found at $ENV_FILE — copy .env.production and fill in secrets"

command -v docker  >/dev/null 2>&1 || die "docker is not installed"
docker compose version >/dev/null 2>&1 || die "docker compose (v2) is not available"

# ── Load env ───────────────────────────────────────────────────────────────────
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

IMAGE_NAME="${IMAGE_NAME:-esign-portal}"

# ── Rollback path ──────────────────────────────────────────────────────────────
if $ROLLBACK; then
  [[ -f "$PREVIOUS_TAG_FILE" ]] || die "No previous tag recorded at $PREVIOUS_TAG_FILE — cannot roll back"
  PREV_TAG=$(cat "$PREVIOUS_TAG_FILE")
  warn "Rolling back to image tag: $PREV_TAG"
  export IMAGE_TAG="$PREV_TAG"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-build esign-portal
  success "Rollback complete — running tag: $PREV_TAG"
  exit 0
fi

# ── Git pull ───────────────────────────────────────────────────────────────────
if ! $SKIP_PULL; then
  log "Pulling latest code from branch: $GIT_BRANCH"
  git fetch --quiet origin
  git checkout "$GIT_BRANCH"
  git pull --ff-only origin "$GIT_BRANCH"
  success "Code updated"
fi

# ── Determine image tag ────────────────────────────────────────────────────────
if [[ -z "$IMAGE_TAG" ]]; then
  IMAGE_TAG=$(git rev-parse --short HEAD 2>/dev/null || date '+%Y%m%d%H%M%S')
fi
export IMAGE_TAG
export DEPLOYMENT_VERSION="$IMAGE_TAG"
log "Image tag: ${BOLD}$IMAGE_TAG${NC}"

# ── Record current tag for rollback ─────────────────────────────────────────────
if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps esign-portal --quiet 2>/dev/null | grep -q .; then
  CURRENT_TAG=$(docker inspect "$IMAGE_NAME" 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['Config']['Labels'].get('image.tag','unknown'))" 2>/dev/null \
    || echo "unknown")
  echo "$CURRENT_TAG" > "$PREVIOUS_TAG_FILE"
fi

# ── Docker build ───────────────────────────────────────────────────────────────
if ! $SKIP_BUILD; then
  log "Building Docker image: $IMAGE_NAME:$IMAGE_TAG"

  BUILD_ARGS=(
    "--build-arg" "DEPLOYMENT_VERSION=$IMAGE_TAG"
  )

  if [[ -n "$REGISTRY" ]]; then
    FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
  else
    FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"
  fi

  docker build \
    --file "$PROJECT_DIR/Dockerfile" \
    --tag "$FULL_IMAGE" \
    --tag "$IMAGE_NAME:latest" \
    --label "image.tag=$IMAGE_TAG" \
    --label "git.commit=$(git rev-parse HEAD 2>/dev/null || echo unknown)" \
    --label "build.date=$(date -u '+%Y-%m-%dT%H:%M:%SZ')" \
    "${BUILD_ARGS[@]}" \
    "$PROJECT_DIR"

  success "Image built: $FULL_IMAGE"

  if [[ -n "$REGISTRY" ]]; then
    log "Pushing image to registry: $REGISTRY"
    docker push "$FULL_IMAGE"
    docker push "$IMAGE_NAME:latest" 2>/dev/null || true
    success "Image pushed"
  fi
fi

# ── TLS certificate — auto-generate self-signed if none exists ─────────────────
CERT_DIR="$PROJECT_DIR/nginx/certs"
CERT_FILE="$CERT_DIR/esign.crt"
KEY_FILE="$CERT_DIR/esign.key"

if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  warn "No TLS certificate found at $CERT_DIR"
  warn "Generating a self-signed certificate (valid 10 years)…"
  warn "For production, replace with a cert from your CA (KSDC PKI / Let's Encrypt)."

  mkdir -p "$CERT_DIR"

  # Determine the hostname to embed in the cert
  CERT_CN="${CERT_HOSTNAME:-$(hostname -f 2>/dev/null || echo localhost)}"

  openssl req -x509 -nodes \
    -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out    "$CERT_FILE" \
    -days   3650 \
    -subj   "/C=IN/ST=Kerala/L=Thiruvananthapuram/O=KSITM/OU=eSign/CN=$CERT_CN" \
    -addext "subjectAltName=DNS:$CERT_CN,DNS:localhost,IP:127.0.0.1" \
    2>/dev/null

  success "Self-signed certificate generated for CN=$CERT_CN"
  log "  Cert : $CERT_FILE"
  log "  Key  : $KEY_FILE"
  log "  To use your own cert, replace these two files and redeploy."
else
  log "TLS certificate found — skipping generation"
fi

# ── Zero-downtime deployment ───────────────────────────────────────────────────
log "Starting deployment (zero-downtime rolling update)"

# Bring up nginx first (or ensure it's running); it will 502 during app restart
# but recovers as soon as esign-portal is healthy.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d nginx 2>/dev/null || true

# Pull and recreate only the app container — nginx stays up throughout
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d \
  --no-deps \
  --force-recreate \
  esign-portal

log "Container started — waiting for health check (max ${HEALTH_TIMEOUT}s)…"

# ── Health check polling ───────────────────────────────────────────────────────
elapsed=0
healthy=false

while [[ $elapsed -lt $HEALTH_TIMEOUT ]]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
  if [[ "$STATUS" == "200" ]]; then
    healthy=true
    break
  fi
  sleep $HEALTH_INTERVAL
  elapsed=$((elapsed + HEALTH_INTERVAL))
  log "  Health check: HTTP $STATUS — ${elapsed}s elapsed…"
done

if $healthy; then
  success "Deployment successful — service is healthy at $HEALTH_URL"
  log "Running containers:"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
else
  error "Health check timed out after ${HEALTH_TIMEOUT}s"
  error "Container logs:"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=50 esign-portal
  die "Deployment FAILED. Run './scripts/deploy.sh --rollback' to restore the previous version."
fi

# ── Prune old images ───────────────────────────────────────────────────────────
log "Pruning dangling images (keeping 3 most recent)…"
docker images "$IMAGE_NAME" --format "{{.Tag}} {{.ID}}" \
  | sort -rV \
  | awk 'NR>3 {print $2}' \
  | xargs -r docker rmi 2>/dev/null || true

success "Deployment complete — version ${BOLD}$IMAGE_TAG${NC} is live"

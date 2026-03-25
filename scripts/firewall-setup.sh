#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
#  firewall-setup.sh — ASP eSign Gateway Frontend
#  Firewall configuration for Kerala State Data Center (KSDC) VM
#
#  Supports both firewalld (RHEL/AlmaLinux/Rocky — typical at KSDC/NIC) and
#  ufw (Ubuntu — less common at KSDC but included for completeness).
#
#  Security model:
#    External internet → Nginx (443 / 80 redirect)
#                     → SSH from KSDC admin range only
#    Nginx internal   → esign-portal:3000 (Docker bridge, no host port)
#    esign-portal     → FastAPI backend (BACKEND_URL, internal LAN or Docker)
#    Coolify admin    → port 8000, restricted to management subnet
#
#  Usage (as root on the KSDC VM):
#    chmod +x scripts/firewall-setup.sh
#    sudo ./scripts/firewall-setup.sh
#
#  Edit the subnet variables below to match your KSDC allocation before running.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ─── KSDC Network Allocation — EDIT THESE ─────────────────────────────────────
# Replace with the actual KSDC/NIC-assigned ranges for your deployment.

# Subnet from which SSH access is permitted (KSDC admin / jump-box range)
ADMIN_SUBNET="10.0.0.0/8"

# Subnet for the KSDC management/monitoring network (Zabbix, Nagios, etc.)
MGMT_SUBNET="10.0.0.0/8"

# FastAPI backend IP or subnet (same VM → 127.0.0.1, separate host → LAN IP)
BACKEND_IP="127.0.0.1/32"

# ── Detect OS / firewall manager ──────────────────────────────────────────────
detect_firewall() {
  if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
    echo "firewalld"
  elif command -v ufw >/dev/null 2>&1; then
    echo "ufw"
  elif command -v iptables >/dev/null 2>&1; then
    echo "iptables"
  else
    echo "none"
  fi
}

FW=$(detect_firewall)
echo "Detected firewall manager: $FW"

# ──────────────────────────────────────────────────────────────────────────────
#  firewalld (RHEL/AlmaLinux/Rocky Linux — standard at KSDC/NIC)
# ──────────────────────────────────────────────────────────────────────────────
configure_firewalld() {
  echo "Configuring firewalld…"

  # Ensure firewalld is running
  systemctl enable --now firewalld

  # ── Default zone: drop all inbound not explicitly allowed ─────────────────
  firewall-cmd --set-default-zone=drop

  # ── SSH — restricted to KSDC admin subnet only ────────────────────────────
  firewall-cmd --permanent --zone=drop \
    --add-rich-rule="rule family='ipv4' source address='$ADMIN_SUBNET' port port='22' protocol='tcp' accept"

  # ── HTTP (80) — Let's Encrypt ACME challenge + redirect to HTTPS ──────────
  # If the KSDC VM is on a private network with no internet-facing ACME,
  # you can restrict this to internal networks only and use an internal CA.
  firewall-cmd --permanent --zone=drop --add-service=http

  # ── HTTPS (443) — main application ingress ────────────────────────────────
  firewall-cmd --permanent --zone=drop --add-service=https

  # ── Coolify Admin UI (8000) — management network only ────────────────────
  # NEVER expose this to 0.0.0.0 — it grants full server control.
  firewall-cmd --permanent --zone=drop \
    --add-rich-rule="rule family='ipv4' source address='$MGMT_SUBNET' port port='8000' protocol='tcp' accept"

  # ── Docker internal bridge — allow container-to-container traffic ──────────
  # Docker adds its own iptables rules for bridge networking; the rich rules
  # below ensure firewalld doesn't interfere with container communication.
  firewall-cmd --permanent --zone=trusted --add-interface=docker0
  firewall-cmd --permanent --zone=trusted --add-interface=br-+   # custom bridges

  # ── Explicitly block direct external access to app/backend ports ──────────
  # Port 3000 (Next.js) must never be reachable from outside; nginx only.
  # Port 5432/6379 (if DB/Redis on same host) must be internal-only.
  # firewalld's drop default zone already blocks these — the rules below are
  # a belt-and-braces explicit deny for audit purposes.
  firewall-cmd --permanent --zone=drop \
    --add-rich-rule="rule family='ipv4' port port='3000' protocol='tcp' reject"
  firewall-cmd --permanent --zone=drop \
    --add-rich-rule="rule family='ipv4' port port='5432' protocol='tcp' reject"
  firewall-cmd --permanent --zone=drop \
    --add-rich-rule="rule family='ipv4' port port='6379' protocol='tcp' reject"

  # ── ICMP — allow ping for network diagnostics ─────────────────────────────
  firewall-cmd --permanent --zone=drop --add-protocol=icmp

  # ── Apply all changes ─────────────────────────────────────────────────────
  firewall-cmd --reload

  echo ""
  echo "firewalld rules applied:"
  firewall-cmd --list-all
}

# ──────────────────────────────────────────────────────────────────────────────
#  ufw (Ubuntu — if used at KSDC)
# ──────────────────────────────────────────────────────────────────────────────
configure_ufw() {
  echo "Configuring ufw…"

  # Reset to defaults and set deny-all inbound policy
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing

  # ── SSH — admin subnet only ────────────────────────────────────────────────
  ufw allow from "$ADMIN_SUBNET" to any port 22 proto tcp comment "SSH - admin subnet"

  # ── HTTP / HTTPS — public ingress ─────────────────────────────────────────
  ufw allow 80/tcp  comment "HTTP - Let's Encrypt / redirect"
  ufw allow 443/tcp comment "HTTPS - main app ingress"

  # ── Coolify admin — management subnet only ────────────────────────────────
  ufw allow from "$MGMT_SUBNET" to any port 8000 proto tcp comment "Coolify admin UI"

  # ── Block direct access to Next.js port ───────────────────────────────────
  ufw deny 3000/tcp comment "Block direct access to Next.js (nginx proxies)"

  # ── Docker — ufw does not auto-manage Docker iptables rules ───────────────
  # Docker bypasses ufw by default. To prevent this, add to /etc/docker/daemon.json:
  #   { "iptables": false }
  # and manage routing manually, OR use the ufw-docker package:
  #   sudo apt-get install ufw-docker
  echo ""
  echo "⚠  NOTE: Docker bypasses ufw by default. If needed, install 'ufw-docker':"
  echo "    sudo apt-get install ufw-docker && sudo ufw-docker install"

  ufw --force enable
  ufw status verbose
}

# ──────────────────────────────────────────────────────────────────────────────
#  iptables fallback (bare-minimum, for VMs where neither firewalld nor ufw
#  is available)
# ──────────────────────────────────────────────────────────────────────────────
configure_iptables() {
  echo "Configuring iptables directly…"

  # Flush existing rules
  iptables -F
  iptables -X

  # Default policies: DROP inbound, ALLOW outbound, ALLOW forwarding (Docker)
  iptables -P INPUT   DROP
  iptables -P FORWARD ACCEPT
  iptables -P OUTPUT  ACCEPT

  # Allow loopback
  iptables -A INPUT -i lo -j ACCEPT

  # Allow established/related connections
  iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

  # SSH — admin subnet
  iptables -A INPUT -p tcp --dport 22 -s "$ADMIN_SUBNET" -j ACCEPT

  # HTTP
  iptables -A INPUT -p tcp --dport 80  -j ACCEPT

  # HTTPS
  iptables -A INPUT -p tcp --dport 443 -j ACCEPT

  # Coolify admin — management subnet
  iptables -A INPUT -p tcp --dport 8000 -s "$MGMT_SUBNET" -j ACCEPT

  # ICMP ping
  iptables -A INPUT -p icmp -j ACCEPT

  # Persist rules (RHEL/CentOS)
  if command -v iptables-save >/dev/null 2>&1; then
    iptables-save > /etc/sysconfig/iptables 2>/dev/null || \
    iptables-save > /etc/iptables/rules.v4 2>/dev/null  || true
  fi

  echo "iptables rules applied:"
  iptables -L -n -v
}

# ── Run the appropriate configuration ─────────────────────────────────────────
case "$FW" in
  firewalld) configure_firewalld ;;
  ufw)       configure_ufw       ;;
  iptables)  configure_iptables  ;;
  none)
    echo "ERROR: No supported firewall manager found."
    echo "Install firewalld: sudo yum install firewalld / sudo apt install ufw"
    exit 1
    ;;
esac

echo ""
echo "── Summary of firewall rules ────────────────────────────────────────────"
echo "  Port 22   (SSH)    — allowed from admin subnet: $ADMIN_SUBNET"
echo "  Port 80   (HTTP)   — allowed (redirect to HTTPS)"
echo "  Port 443  (HTTPS)  — allowed (main app ingress via Nginx)"
echo "  Port 8000 (Coolify)— allowed from mgmt subnet: $MGMT_SUBNET"
echo "  Port 3000 (Next.js)— BLOCKED (internal Docker only)"
echo "  All other ports    — DROPPED"
echo ""
echo "Done. Remember to:"
echo "  1. Replace ADMIN_SUBNET / MGMT_SUBNET at the top of this script with"
echo "     your actual KSDC-allocated ranges before running."
echo "  2. Verify rules with: sudo firewall-cmd --list-all  OR  sudo ufw status verbose"
echo "  3. Test SSH login from a second terminal before closing this session."

# Deploying eSign Portal on a Private VM with Coolify

Self-hosting guide for the **ASP eSign Gateway Frontend** using [Coolify](https://coolify.io) — an open-source PaaS that manages Docker deployments, automatic TLS, reverse proxying, and rolling updates on any private server.

> **Source references:** [Coolify Installation](https://coolify.io/docs/get-started/installation) (updated Apr 2, 2026) · [Coolify Environment Variables](https://coolify.io/docs/knowledge-base/environment-variables) · [Coolify Rolling Updates](https://coolify.io/docs/knowledge-base/rolling-updates) · [Coolify Health Checks](https://coolify.io/docs/knowledge-base/health-checks) · [Bun Docker Guide](https://bun.sh/guides/ecosystem/docker)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Private VM                                              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Coolify (port 8000 — admin UI only)            │    │
│  │  Traefik reverse proxy (ports 80 / 443)         │    │
│  │                                                  │    │
│  │   HTTPS ──▶ Traefik ──▶ esign-portal:3000 ──────────┼──▶ FastAPI
│  │             (TLS         (Next.js / Bun           │    │     (BACKEND_URL,
│  │              auto)        standalone)             │    │      server-side only)
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**How Coolify handles the stack:**
- Traefik (or Caddy) acts as the reverse proxy, automatically provisioning Let's Encrypt TLS certificates for your domain.
- Coolify builds your image from the `Dockerfile` in your Git repository, then runs it as a Docker container.
- Rolling updates: Coolify starts a new container, waits for the health check to pass, then stops the old container — zero downtime.
- `BACKEND_URL` is injected as a secret environment variable at runtime, never visible in the client bundle.

---

## Prerequisites

| Requirement | Details |
|---|---|
| **VM** | Any Linux server (Debian/Ubuntu, RHEL/AlmaLinux, Alpine, etc.) with SSH root access |
| **Hardware** | 2 CPU cores, 2 GB RAM, 30 GB disk (Coolify's minimum — allocate extra for the app) |
| **Architecture** | AMD64 or ARM64 |
| **Docker** | Installed by the Coolify installer (v24+); do **not** use Docker via snap. Bun image: `oven/bun:1-alpine` |
| **Git repository** | Your eSign portal source code pushed to GitHub, GitLab, Gitea, or Bitbucket |
| **Domain** | A private DNS record or public domain pointing to the VM's IP (required for TLS) |

---

## Part 1 — Install Coolify on the Private VM

### Quick Installation (Recommended)

SSH into your VM as root and run:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

The installer will:
- Install essential tools (`curl`, `wget`, `git`, `jq`, `openssl`)
- Install Docker Engine v24+
- Set up directories under `/data/coolify`
- Configure SSH keys for server management
- Start Coolify

After the script finishes, open the Coolify admin UI at:

```
http://<vm-ip>:8000
```

> **Important:** Create your admin account immediately after installation. The registration page is publicly accessible until the first account is created.

### Manual Installation (Non-LTS Ubuntu or custom distros)

```bash
# 1. Create directories
mkdir -p /data/coolify/{source,ssh,applications,databases,backups,services,proxy,webhooks-during-maintenance}
mkdir -p /data/coolify/ssh/{keys,mux}
mkdir -p /data/coolify/proxy/dynamic

# 2. Generate SSH key for Coolify
ssh-keygen -f /data/coolify/ssh/keys/id.root@host.docker.internal \
  -t ed25519 -N '' -C root@coolify
cat /data/coolify/ssh/keys/id.root@host.docker.internal.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. Download configuration files
curl -fsSL https://cdn.coollabs.io/coolify/docker-compose.yml \
  -o /data/coolify/source/docker-compose.yml
curl -fsSL https://cdn.coollabs.io/coolify/docker-compose.prod.yml \
  -o /data/coolify/source/docker-compose.prod.yml
curl -fsSL https://cdn.coollabs.io/coolify/.env.production \
  -o /data/coolify/source/.env
curl -fsSL https://cdn.coollabs.io/coolify/upgrade.sh \
  -o /data/coolify/source/upgrade.sh

# 4. Set permissions
chown -R 9999:root /data/coolify
chmod -R 700 /data/coolify

# 5. Generate secrets (run ONCE — changing these later breaks the installation)
sed -i "s|APP_ID=.*|APP_ID=$(openssl rand -hex 16)|g" /data/coolify/source/.env
sed -i "s|APP_KEY=.*|APP_KEY=base64:$(openssl rand -base64 32)|g" /data/coolify/source/.env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -base64 32)|g" /data/coolify/source/.env
sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$(openssl rand -base64 32)|g" /data/coolify/source/.env
sed -i "s|PUSHER_APP_ID=.*|PUSHER_APP_ID=$(openssl rand -hex 32)|g" /data/coolify/source/.env
sed -i "s|PUSHER_APP_KEY=.*|PUSHER_APP_KEY=$(openssl rand -hex 32)|g" /data/coolify/source/.env
sed -i "s|PUSHER_APP_SECRET=.*|PUSHER_APP_SECRET=$(openssl rand -hex 32)|g" /data/coolify/source/.env

# 6. Create Docker network and start Coolify
docker network create --attachable coolify
docker compose \
  --env-file /data/coolify/source/.env \
  -f /data/coolify/source/docker-compose.yml \
  -f /data/coolify/source/docker-compose.prod.yml \
  up -d --pull always --remove-orphans --force-recreate
```

---

## Part 2 — Prepare the Dockerfile for Coolify

Coolify builds the image directly from your repository's `Dockerfile`. The key requirements for Coolify compatibility are:
1. **Non-root user** — Coolify runs containers under a non-root user by default.
2. **`HEALTHCHECK` instruction** — required for Coolify's rolling updates to work.
3. **`PORT` and `HOST` env vars** — Coolify predefined variables; set them as defaults in the Dockerfile.

> **Bun Docker image tag:** The official Bun Docker guide ([bun.sh/guides/ecosystem/docker](https://bun.sh/guides/ecosystem/docker)) recommends the `oven/bun:1` major-version tag (or `oven/bun:1-alpine` for Alpine) — do not pin to a specific minor like `1.2`.
>
> **Lockfile:** Bun 1.2+ uses a text-based lockfile `bun.lock` (replacing the old binary `bun.lockb`). The `COPY` instruction below reflects this.

Create (or update) `Dockerfile` at the project root:

```dockerfile
# syntax=docker/dockerfile:1

# ─── Stage 1: Dependencies & Build ─────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Copy public/ and .next/static/ into standalone (not copied automatically)
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# ─── Stage 2: Runtime ───────────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid  1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

RUN chmod -R g=u /app

USER 1001

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check — required for Coolify rolling updates.
# Coolify routes this through Traefik once the check passes.
# wget is available in bun:alpine; no extra install needed.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["bun", "server.js"]
```

> **`/api/health` endpoint** — add this if it doesn't exist:
>
> ```ts
> // src/app/api/health/route.ts
> export function GET() {
>   return Response.json({ status: "ok" });
> }
> ```

Also ensure `next.config.ts` enables standalone output:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  deploymentId: process.env.DEPLOYMENT_VERSION, // version skew protection
  serverExternalPackages: [],
};

export default nextConfig;
```

Commit and push both files to your repository.

---

## Part 3 — Connect Your Git Repository to Coolify

1. In the Coolify UI, go to **Sources** → **Add**.
2. Choose your Git provider (GitHub, GitLab, Gitea, etc.).
3. Follow the OAuth flow to grant Coolify repository access.
4. Coolify will install a webhook on your repository so that every push to the configured branch triggers an automatic deployment.

> For a completely private setup with no public internet access, use a self-hosted Gitea instance on the same VM and connect it via Coolify's Gitea integration.

---

## Part 4 — Create the Project and Application in Coolify

1. In the Coolify UI: **Projects** → **New Project** → name it `esign`.
2. Inside the project: **New Environment** → name it `production`.
3. In the environment: **New Resource** → **Application**.
4. Select your connected Git source and choose the `esign_portal` repository.
5. Select the branch to deploy (e.g., `main`).
6. Coolify detects the `Dockerfile` automatically — confirm **Build Pack: Dockerfile**.
7. Set **Port** to `3000`.
8. Set the **Domain** to your private hostname, e.g., `https://esign.internal.example.com`. Coolify will automatically provision a TLS certificate via Let's Encrypt (the VM must be reachable on port 80/443 from the internet for the ACME challenge, or use a DNS challenge for fully private setups).

---

## Part 5 — Configure Environment Variables

In the application's **Environment Variables** tab, add the following. All sensitive values should have **Secret** checked (hidden in the UI after saving).

| Variable | Value | Secret | Build Variable |
|---|---|---|---|
| `BACKEND_URL` | `http://<fastapi-host>:8000` | ✅ Yes | No |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | `<base64-32-byte-key>` | ✅ Yes | No |
| `DEPLOYMENT_VERSION` | `v1.0.0` (update per release) | No | No |
| `NODE_ENV` | `production` | No | No |
| `NEXT_TELEMETRY_DISABLED` | `1` | No | No |

**Generate the encryption key:**

```bash
openssl rand -base64 32
```

**Notes:**
- `BACKEND_URL` points to your FastAPI backend. Use the Docker internal DNS name if both services are on the same VM (e.g., `http://esign-api:8000`) or a LAN IP / internal hostname.
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` is required when running across multiple containers (or after rolling updates) to prevent `"Failed to find Server Action"` errors.
- `DEPLOYMENT_VERSION` pairs with the `deploymentId` in `next.config.ts` to protect against version skew during rolling updates.
- Coolify's predefined variables `PORT` (`3000`) and `HOST` (`0.0.0.0`) are set automatically — no need to add them manually.

---

## Part 6 — Configure the Health Check in Coolify UI

Coolify can perform health checks via the UI or via the `HEALTHCHECK` instruction in the Dockerfile. The Dockerfile definition takes precedence when both are configured.

Since the `HEALTHCHECK` instruction is already in the Dockerfile (Step 2), Coolify will use it automatically.

**To verify/inspect in the UI:**
1. In your application settings, open the **Health Check** tab.
2. You should see the Dockerfile-based check is active.
3. If you want to override with the UI instead: set `Path` to `/api/health`, `Port` to `3000`, `Method` to `GET`.

> From [Coolify Health Checks docs](https://coolify.io/docs/knowledge-base/health-checks): The container must have `curl` or `wget` installed for UI-based health checks. The `oven/bun:alpine` image includes `wget`, so UI-based checks work too.

---

## Part 7 — Deploy

1. In your application page, click **Deploy**.
2. Coolify pulls your repository, builds the image using the `Dockerfile`, and starts the container.
3. Traefik automatically routes `https://esign.internal.example.com` → container port `3000`.
4. Monitor the build and deployment logs in the **Logs** tab.

---

## Part 8 — Cookie & CORS Configuration

The app uses **HttpOnly cookies** for auth. Ensure the FastAPI backend is configured to accept the Coolify domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://esign.internal.example.com"],
    allow_credentials=True,  # required for cookie forwarding
    allow_methods=["*"],
    allow_headers=["*"],
)

response.set_cookie(
    "access_token",
    value=access_token,
    httponly=True,
    secure=True,      # TLS is handled by Traefik — always True in production
    samesite="lax",   # "none" only for genuinely cross-site; "lax" is correct here
)
```

---

## Rolling Updates

Coolify supports automatic rolling updates when the following conditions are met (from [Coolify Rolling Updates docs](https://coolify.io/docs/knowledge-base/rolling-updates)):

1. ✅ A valid health check is configured and passing.
2. ✅ Default container naming is used (do not set a custom container name).
3. ✅ No port mapped directly to the host machine (Traefik handles routing — ports are not host-mapped).
4. ✅ Not a Docker Compose deployment (this is a single Dockerfile application).

**How it works:** When a new deployment is triggered (via Push to Deploy or the Coolify UI), Coolify starts a new container, waits for the `HEALTHCHECK` to return healthy, then stops the old container. Traffic continues flowing to the old container during this window — zero downtime.

**Triggering a new deployment:**
- **Automatic (recommended):** Push to your configured branch — the Git webhook triggers a redeploy.
- **Manual:** Click **Redeploy** in the Coolify UI.
- **Via Coolify API/webhook:**
  ```bash
  curl -X POST "http://<vm-ip>:8000/api/v1/deploy?uuid=<resource-uuid>&force=false" \
    -H "Authorization: Bearer <COOLIFY_API_TOKEN>"
  ```

**Updating environment variables on a new release:**
1. In the **Environment Variables** tab, update `DEPLOYMENT_VERSION` to the new value (e.g., the git SHA or tag).
2. Click **Redeploy**.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Build fails: `command not found` | Bun version mismatch | Check `oven/bun:1.2-alpine` is available; pin a specific tag |
| Container starts but health check fails | `/api/health` route missing | Add `src/app/api/health/route.ts` and redeploy |
| Rolling update not triggering | Health check not configured | Verify HEALTHCHECK in Dockerfile or configure via UI |
| `No available server` from Traefik | Health check is failing | Check container logs in Coolify UI → Logs tab |
| Login cookies not working | `SameSite=None` without HTTPS | Ensure domain uses `https://` — Coolify/Traefik auto-provisions TLS |
| `"Failed to find Server Action"` | Missing encryption key | Add `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to environment variables |
| `BACKEND_URL` not injecting | Variable not saved | Verify the var is saved under the correct environment in Coolify |
| Build cache not invalidating | Stale layer | Enable "Include Source Commit in Build" in General settings and add `SOURCE_COMMIT` env var |

### View live logs

In the Coolify UI:
- **Application → Logs**: real-time container stdout/stderr
- **Application → Deployments**: full build log for each deploy

Or via the Coolify CLI:
```bash
# Install Coolify CLI
curl -fsSL https://coolify.io/install-cli.sh | bash

# Stream logs
coolify logs <resource-uuid>
```

---

## Comparison: Coolify vs OpenShift

| | Coolify | OpenShift |
|---|---|---|
| **Setup complexity** | Low — single install script | High — cluster provisioning |
| **TLS / reverse proxy** | Automatic (Traefik/Caddy + Let's Encrypt) | Manual Route + cert management |
| **Scaling** | Single container per app (no pod replicas) | Horizontal pod autoscaling |
| **Rolling updates** | Single new container replaces old | Full rolling update with replica sets |
| **Resource overhead** | ~2 GB RAM (Coolify itself) | Much higher (cluster control plane) |
| **Best for** | Single-VM private deployments, small teams | Enterprise-grade, multi-node clusters |

---

## Related Docs

- [Coolify Installation](https://coolify.io/docs/get-started/installation)
- [Coolify Environment Variables](https://coolify.io/docs/knowledge-base/environment-variables)
- [Coolify Rolling Updates](https://coolify.io/docs/knowledge-base/rolling-updates)
- [Coolify Health Checks](https://coolify.io/docs/knowledge-base/health-checks)
- [OpenShift Deployment Guide](./DEPLOY_VM.md)
- [System Architecture](./architecture.md)
- [Cookie Auth Setup & Debugging](./COOKIE_AUTH_SETUP.md)
- [Development Guidelines](./DEVELOPMENT.md)

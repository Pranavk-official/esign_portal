# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────────────────────────────
#  ASP eSign Gateway Frontend — Production Dockerfile
#
#  Two-stage build:
#    Stage 1 (builder) — install deps + run `bun run build`
#    Stage 2 (runner)  — minimal Alpine runtime, non-root user
#
#  Key design decisions:
#  • Uses oven/bun:1-alpine (official; tracks latest 1.x patch automatically)
#  • Non-root UID 1001 — compatible with OpenShift restricted SCC and Coolify
#  • Health check via /api/health — required for Coolify rolling updates
#  • PORT / HOSTNAME env vars recognised by Next.js standalone server.js
#  • BACKEND_URL is a runtime-only server secret — it is NOT needed at build
#    time and is never embedded in the client bundle.
#  • bun.lock (text-based, Bun 1.2+) is used for lockfile caching.
# ──────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Dependencies & Build ────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Cache dependency layer before copying full source
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy full source tree
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Production build — output: standalone is set in next.config.ts
RUN bun run build

# Copy assets that Next.js standalone does NOT include automatically
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user (UID 1001 / GID 1001)
# Required for: Coolify default container policy, OpenShift restricted SCC
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid  1001 nextjs

# Copy only the minimal standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Allow the root group to read/write — OpenShift runs pods with arbitrary UIDs
# in the root group, so group-write permission is required.
RUN chmod -R g=u /app

USER 1001

EXPOSE 3000

# These two env vars are read by Next.js standalone server.js at startup.
# Coolify also provides PORT automatically — this is the safe fallback default.
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ── Health check ───────────────────────────────────────────────────────────────
# Coolify polls this to determine when the container is healthy before
# cutting over traffic (rolling update). wget is pre-installed in bun:alpine.
#
# Tune timing for KSDC VM performance:
#   --start-period=40s  — give Next.js time to initialise on first boot
#   --interval=15s      — poll frequency
#   --timeout=5s        — per-attempt deadline
#   --retries=3         — mark unhealthy after 3 consecutive failures
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["bun", "server.js"]

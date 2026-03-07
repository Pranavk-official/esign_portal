# Deploying eSign Portal on a Private VM with OpenShift

Self-hosting guide for the **ASP eSign Gateway Frontend** on a private VM running OpenShift Container Platform (or OKD).

> **Source references:** [Next.js 16 Self-Hosting Guide](https://nextjs.org/docs/app/guides/self-hosting) (updated Feb 27, 2026) · [OpenShift 4.17 Deployments](https://docs.redhat.com/en/documentation/openshift_container_platform/4.17/html/building_applications/deployments) · [Bun Docker Guide](https://bun.sh/guides/ecosystem/docker)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Private VM (OpenShift Single-Node / CRC / OKD)         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  OpenShift Project: esign                        │   │
│  │                                                  │   │
│  │  ┌─────────────┐     ┌───────────────────────┐  │   │
│  │  │  Route (TLS)│────▶│  Service (ClusterIP)  │  │   │
│  │  │  esign.vm   │     │  esign-portal : 3000  │  │   │
│  │  └─────────────┘     └──────────┬────────────┘  │   │
│  │                                  │               │   │
│  │                       ┌──────────▼────────────┐  │   │
│  │                       │  Deployment (apps/v1) │  │   │
│  │                       │  esign-portal         │  │   │
│  │                       │  (Next.js 16 / Node)  │  │   │
│  │                       │    BACKEND_URL ─────────────┼──▶ FastAPI
│  │                       └───────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

> **Key design point:** The browser never talks directly to the FastAPI backend. All requests go through the Next.js `/api/*` proxy route, which forwards them to `BACKEND_URL` server-side — keeping the backend address private.

> **OCP note:** As of OpenShift 4.14, `DeploymentConfig` objects are deprecated. This guide uses the recommended `apps/v1 Deployment` object throughout.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| OpenShift / OKD | 4.14 + | Single-node, CRC, or full cluster on the VM |
| `oc` CLI | matching cluster | `oc login https://<vm-ip>:6443` |
| Podman or Docker | any recent | For building the container image |
| Bun | 1.x (latest stable) | Runtime image for `bun server.js`; Docker image tag `oven/bun:1-alpine` tracks latest 1.x stable |
| Internal image registry | — | OpenShift built-in (`image-registry.openshift-image-registry.svc`) or external (Nexus, Harbor) |

---

## Step 1 — Enable Standalone Output in `next.config.ts`

Next.js `output: "standalone"` generates a minimal `.next/standalone` folder containing only the files required for production. The standalone output includes a `server.js` entry point that can be run with any Node.js-compatible runtime — this project uses Bun (`bun server.js`).

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",  // ← enables .next/standalone build artifact
  serverExternalPackages: [],
};

export default nextConfig;
```

> From the [Next.js output docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/output): `public/` and `.next/static/` are **not** copied automatically — you must copy them manually (the Dockerfile below handles this).

---

## Step 2 — Write the Dockerfile

Two-stage build: Bun for installing dependencies and building, then a second Bun Alpine stage for the minimal runtime. Bun is a drop-in Node.js-compatible runtime — `bun server.js` runs the Next.js standalone output identically to `node server.js`.

> **Bun Docker image tag:** The official Bun Docker guide ([bun.sh/guides/ecosystem/docker](https://bun.sh/guides/ecosystem/docker)) recommends using the `oven/bun:1` major-version tag (or `oven/bun:1-alpine` for Alpine) so containers automatically receive patch and minor updates. Avoid pinning to a specific minor like `1.2`.
>
> **Lockfile:** Bun 1.2 switched from a binary lockfile (`bun.lockb`) to a text-based lockfile (`bun.lock`). Use `bun.lock` in `COPY` instructions.

```dockerfile
# syntax=docker/dockerfile:1

# ─── Stage 1: Dependencies & Build ─────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Cache dependency layer separately
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy full source
COPY . .

# Production build — BACKEND_URL is server-side only, not needed at build time
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Copy public/ and .next/static/ into standalone so server.js serves them
# (Next.js standalone does not copy these automatically)
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# ─── Stage 2: Runtime ───────────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user required by OpenShift's restricted Security Context Constraint (SCC)
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid  1001 nextjs

# Copy only the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# OpenShift may run as an arbitrary UID in the root group — grant group-write
RUN chmod -R g=u /app

USER 1001

EXPOSE 3000

# PORT and HOSTNAME are read by Next.js standalone server.js at startup
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
```

---

## Step 3 — Multi-Replica Considerations (Next.js 16)

When running **2 or more replicas** (the recommended replica count for zero-downtime deployments), Next.js requires two additional environment variables to prevent subtle runtime errors.

### 3a. Server Functions Encryption Key

Next.js encrypts Server Function closure variables before sending them to the client. By default a unique key is generated **per build** — but if multiple pods serve different builds simultaneously during a rolling update, decryption mismatches produce `"Failed to find Server Action"` errors.

Set a consistent key across all replicas:

```bash
# Generate a 32-byte base64-encoded key (do this once per environment)
openssl rand -base64 32
```

Add it to the secret (see Step 5):

```bash
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="<base64-key>"
```

### 3b. Deployment ID (Version Skew Protection)

The [`deploymentId`](https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId) config value lets Next.js detect and handle version skew during rolling deployments. When a mismatch is found between a client's cached deployment ID and the server's, Next.js triggers a hard navigation (full page reload) to fetch assets from the current deployment, preventing missing-asset errors.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  deploymentId: process.env.DEPLOYMENT_VERSION,  // set to git SHA or build tag
  serverExternalPackages: [],
};
```

Pass `DEPLOYMENT_VERSION` as an env var at build time (e.g. the image tag or git SHA).

### 3c. Shared Cache

> From the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr): each pod has its own in-memory cache (defaults to 50 MB) that is **not shared** between pods.

For this app (a dynamic fully-authenticated dashboard), ISR/static caching is not a concern — all pages are dynamically rendered (`private, no-cache`). No custom cache handler is needed unless you add ISR pages in the future.

---

## Step 4 — Build and Push the Image

### Option A — OpenShift Internal Registry

```bash
# Log in to the cluster
oc login https://<vm-ip>:6443 -u <user> -p <password>

# Create the project (skip if it already exists)
oc new-project esign

# Expose the internal registry's public route
oc patch configs.imageregistry.operator.openshift.io cluster \
  --type merge \
  --patch '{"spec":{"defaultRoute":true}}'

REGISTRY=$(oc get route default-route -n openshift-image-registry \
  --template='{{ .spec.host }}')

# Authenticate Podman with the registry using your oc token
podman login "$REGISTRY" \
  -u $(oc whoami) \
  -p $(oc whoami -t) \
  --tls-verify=false   # only needed for self-signed certs in private lab environments

# Build and push
podman build -t "$REGISTRY/esign/esign-portal:latest" .
podman push "$REGISTRY/esign/esign-portal:latest" --tls-verify=false
```

### Option B — External Registry (Nexus / Harbor)

```bash
podman build -t registry.internal.example.com/esign/esign-portal:latest .
podman push  registry.internal.example.com/esign/esign-portal:latest
```

---

## Step 5 — Create the Secret for Environment Variables

`BACKEND_URL` must **never** be in a plain ConfigMap because it reveals the internal backend address. Use a Secret.

```bash
# Generate the encryption key first (see Step 3a)
ENCRYPTION_KEY=$(openssl rand -base64 32)

oc create secret generic esign-portal-env \
  --from-literal=BACKEND_URL="http://esign-api-svc.esign.svc.cluster.local:8000" \
  --from-literal=NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  --from-literal=DEPLOYMENT_VERSION="v1.0.0" \
  -n esign
```

> - Use the OpenShift **Service** DNS name (`<svc>.<namespace>.svc.cluster.local`) if the FastAPI backend runs in the same cluster.
> - Use a LAN IP/hostname (e.g. `http://10.5.141.53:8000`) if the backend runs outside the cluster.
> - Update `DEPLOYMENT_VERSION` to your current image tag or git SHA on every release.

---

## Step 6 — Apply the Deployment Manifest

> OCP 4.17 recommendation: use `apps/v1 Deployment` — not `DeploymentConfig` (deprecated since OCP 4.14). The native Kubernetes `Deployment` uses a controller-loop driven rolling strategy that supports proportional scaling and mid-rollout pausing.

Save as `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: esign-portal
  namespace: esign
  labels:
    app: esign-portal
spec:
  replicas: 2
  selector:
    matchLabels:
      app: esign-portal
  # Rolling update strategy (default in OCP 4.17)
  # maxSurge: allow one extra pod during rollout (fast rollout)
  # maxUnavailable: keep all current pods running until new pods are Ready
  strategy:
    type: Rolling
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: esign-portal
    spec:
      # OpenShift restricted SCC requires runAsNonRoot
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      # Graceful shutdown — OpenShift sends SIGTERM; Next.js `after()` callbacks
      # need time to complete before the pod is killed (default: 30s)
      terminationGracePeriodSeconds: 30
      containers:
        - name: esign-portal
          image: image-registry.openshift-image-registry.svc:5000/esign/esign-portal:latest
          ports:
            - containerPort: 3000
          # Inject all env vars (BACKEND_URL, encryption key, deployment version)
          envFrom:
            - secretRef:
                name: esign-portal-env
          env:
            - name: NODE_ENV
              value: "production"
            - name: NEXT_TELEMETRY_DISABLED
              value: "1"
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
            runAsNonRoot: true
          # Adjust to your VM's available capacity
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          # Readiness probe gates rolling updates — a new pod must pass before
          # the old pod is removed (required for maxUnavailable: 0 to work)
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
            failureThreshold: 3
```

> Add a health endpoint if you don't have one:
>
> ```ts
> // src/app/api/health/route.ts
> export function GET() {
>   return Response.json({ status: "ok" });
> }
> ```

```bash
oc apply -f k8s/deployment.yaml
```

---

## Step 7 — Create the Service

Save as `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: esign-portal-svc
  namespace: esign
spec:
  selector:
    app: esign-portal
  ports:
    - name: http
      port: 80
      targetPort: 3000
  type: ClusterIP
```

```bash
oc apply -f k8s/service.yaml
```

---

## Step 8 — Create a Route with TLS

OpenShift Routes terminate TLS at the built-in HAProxy router and forward plain HTTP to the Service. The HAProxy router also acts as the reverse proxy that Next.js recommends placing in front of the server for production deployments.

### Option A — Edge TLS (cluster-managed certificate)

```yaml
# k8s/route.yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: esign-portal
  namespace: esign
spec:
  host: esign.apps.<vm-ip>.nip.io   # or your real private DNS hostname
  to:
    kind: Service
    name: esign-portal-svc
    weight: 100
  port:
    targetPort: http
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect   # HTTP → HTTPS redirect
```

```bash
oc apply -f k8s/route.yaml

# Print the public URL
oc get route esign-portal -n esign -o jsonpath='{.spec.host}'
```

### Option B — Custom Certificate

```bash
oc create route edge esign-portal \
  --service=esign-portal-svc \
  --hostname=esign.internal.example.com \
  --cert=tls.crt \
  --key=tls.key \
  --ca-cert=ca.crt \
  --insecure-policy=Redirect \
  -n esign
```

---

## Step 9 — Cookie & CORS Configuration

This app uses **HttpOnly cookies** for auth. The FastAPI backend must be configured to allow the Next.js server's origin and to set cookies with the correct attributes.

### FastAPI backend

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://esign.apps.<vm-ip>.nip.io"],
    allow_credentials=True,   # required: allows cookies to be forwarded
    allow_methods=["*"],
    allow_headers=["*"],
)

response.set_cookie(
    "access_token",
    value=access_token,
    httponly=True,
    secure=True,       # HTTPS is enforced by the Route — this is always True in prod
    samesite="lax",    # "lax" for same-site; "none" only if truly cross-site (requires secure=True)
)
```

### Next.js proxy

The existing `src/app/api/[...path]/route.ts` proxy already keeps `BACKEND_URL` server-side and forwards the `Cookie` header automatically. No changes are needed.

---

## Step 10 — Verify the Deployment

```bash
# Check Pod status
oc get pods -n esign -l app=esign-portal

# Tail Pod logs
oc logs -f deployment/esign-portal -n esign

# Confirm rollout completes successfully
oc rollout status deployment/esign-portal -n esign

# Get the Route URL
oc get route esign-portal -n esign -o jsonpath='{.spec.host}'
```

---

## Rolling Updates

When deploying a new version, update the secret's `DEPLOYMENT_VERSION` and the Deployment's image tag together:

```bash
# 1. Build and push the new image
VERSION="v1.1.0"
podman build -t "$REGISTRY/esign/esign-portal:$VERSION" .
podman push "$REGISTRY/esign/esign-portal:$VERSION" --tls-verify=false

# 2. Patch the secret with the new version (for version skew protection)
oc patch secret esign-portal-env -n esign \
  --type merge \
  --patch "{\"stringData\":{\"DEPLOYMENT_VERSION\":\"$VERSION\"}}"

# 3. Update the Deployment's image — triggers an automatic rolling update
oc set image deployment/esign-portal \
  esign-portal=image-registry.openshift-image-registry.svc:5000/esign/esign-portal:$VERSION \
  -n esign

# 4. Monitor the rolling update
# With maxSurge=1 and maxUnavailable=0, OCP spins up a new pod and waits for
# it to pass readiness before terminating the old one — zero downtime.
oc rollout status deployment/esign-portal -n esign
```

### Rollback

```bash
# Roll back to the previous revision
oc rollout undo deployment/esign-portal -n esign

# Or roll back to a specific revision
oc rollout history deployment/esign-portal -n esign
oc rollout undo deployment/esign-portal --to-revision=<N> -n esign
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Pods in `CrashLoopBackOff` | Container attempts to run as root | Verify `USER 1001` in Dockerfile; check `oc describe pod` for SCC rejection |
| `BACKEND_URL` not set | Secret not mounted | `oc get secret esign-portal-env -n esign` |
| 502 Bad Gateway | FastAPI backend unreachable | Exec into Pod and test: `oc exec <pod> -n esign -- wget -qO- http://<BACKEND_URL>/health` |
| Login cookies not persisted | `secure` cookie over HTTP | Ensure Route has `tls.termination: edge` and `insecureEdgeTerminationPolicy: Redirect` |
| `ImagePullBackOff` | Registry pull secret missing | Create a pull secret and link it: `oc secrets link default <pull-secret> --for=pull -n esign` |
| Cross-origin cookie rejected | `SameSite=None` without `Secure` | Cookies with `SameSite=None` require `Secure=True`; the Route must use TLS |
| `"Failed to find Server Action"` errors | Mismatched encryption key across pods | Ensure `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` is the same value in the secret for all pods |
| Missing JS/CSS assets after deploy | Version skew — client cached old deployment ID | Set `deploymentId` in `next.config.ts` + `DEPLOYMENT_VERSION` secret (see Step 3b) |
| Deployment stuck — new pod never Ready | Readiness probe failing | Check `/api/health` endpoint exists; inspect probe logs: `oc describe pod <pod> -n esign` |

### Exec into a running Pod for debugging

```bash
oc exec -it deployment/esign-portal -n esign -- sh

# Test backend connectivity
wget -qO- http://esign-api-svc.esign.svc.cluster.local:8000/health

# Check env vars are injected
env | grep -E 'BACKEND_URL|DEPLOYMENT_VERSION'
```

---

## Related Docs

- [Next.js Self-Hosting Guide](https://nextjs.org/docs/app/guides/self-hosting) — reverse proxy, caching, env vars, version skew (Next.js 16.1.6)
- [Next.js output: standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — standalone build details
- [OCP 4.17 Deployments](https://docs.redhat.com/en/documentation/openshift_container_platform/4.17/html/building_applications/deployments) — Deployment objects, rolling strategy, rollback
- [System Architecture](./architecture.md)
- [Cookie Auth Setup & Debugging](./COOKIE_AUTH_SETUP.md)
- [Development Guidelines](./DEVELOPMENT.md)

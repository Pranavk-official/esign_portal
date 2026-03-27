# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ASP eSign Gateway Frontend — Next.js 16 App Router portal for India's Aadhaar eSign service. Two-role admin panel (Super Admin / Portal Admin) backed by a FastAPI backend.

## Commands

- `bun dev` — Start dev server
- `bun run build` — Production build (standalone output)
- `bun run lint` / `bun run lint:fix` — ESLint
- `bun run format` / `bun run format:check` — Prettier
- `./scripts/deploy.sh` — Docker build + zero-downtime deploy to KSDC VM
- `./scripts/restore.sh` — Reverse a deployment

## Architecture

**Stack:** Next.js 16, React 19, TypeScript 5, Bun, Tailwind CSS 4, Shadcn UI (new-york style), Zustand 5, React Query 5, Zod 4, Axios.

**Route groups** define domain boundaries:
- `(auth)/` — Public auth routes (`/login`)
- `(admin)/` — Super Admin context (gateway operator), components in `(admin)/_components/`
- `(portal)/` — Portal Admin context (department manager), components in `(portal)/_components/`
- `components/ui/` — Only context-agnostic Shadcn primitives; domain components go in their route group's `_components/`

**State management (3 layers, don't mix):**
1. **Server state** — React Query (`src/hooks/use-*.ts`). Never put fetched data into Zustand.
2. **Client state** — Zustand (`src/lib/stores/`). Only auth user profile and global UI.
3. **Form state** — React Hook Form + Zod (`src/lib/schemas/`).

**Auth flow** — HttpOnly cookie-based (OTP). No tokens in JS/localStorage.
- Server guard: `src/proxy.ts` (cookie-presence check, no JWT decryption)
- Client guard: `useRequireAuth({ requiredRoles: [ROLES.SUPER_ADMIN] })`
- Roles: use constants from `src/lib/auth/roles.ts`, never raw strings
- On 401: Axios interceptor auto-refreshes via `refresh_token` cookie

**API proxy:** Frontend requests go to `/api/*` (same-origin) → `src/app/api/[...path]/route.ts` forwards to `BACKEND_URL` server-side. Backend IP never exposed to client.

**Error handling:** Centralized, not per-component. Axios interceptor maps HTTP status codes to typed `AppError` subclasses (`src/lib/errors.ts`). Mutation errors auto-toast via `QueryProvider`'s `MutationCache.onError`. Do NOT manually `try/catch` + `toast.error()` — only define `onSuccess`. Suppress with `meta: { suppressErrorToast: true }`.

## Key Files

| Purpose | Path |
|---|---|
| API client + interceptors | `src/lib/api/client.ts` |
| API proxy to backend | `src/app/api/[...path]/route.ts` |
| Typed error classes | `src/lib/errors.ts` |
| Auth store (Zustand) | `src/lib/stores/auth-store.ts` |
| Role constants & helpers | `src/lib/auth/roles.ts` |
| Server-side route guard | `src/proxy.ts` |
| Global error/toast wiring | `src/providers/query-provider.tsx` |
| Health check (Docker) | `src/app/api/health/route.ts` |
| Nginx config | `nginx/conf.d/esign.conf` |

## API Layer Pattern

```
src/lib/api/<domain>.ts              → Axios calls, typed returns
src/lib/api/types.ts                 → PaginatedResponse<T>, query param interfaces
src/hooks/use-<domain>.ts            → useQuery wrappers (reads)
src/hooks/use-<domain>-mutations.ts  → useMutation wrappers (writes)
src/lib/schemas/<domain>.ts          → Zod schemas + inferred types
```

## Code Conventions

- Named function exports (`export function Name()`), not const arrows
- Props: `interface NameProps {}` above the component
- Files: `kebab-case.tsx`, mark client components with `"use client"`
- Icons: `lucide-react`. UI primitives: `@/components/ui/*`
- Import aliases: `@/components`, `@/lib`, `@/hooks`
- Import order enforced: React/Next → third-party → `@/` → local `./`
- No `any` — use `unknown` + Zod validation. Unused vars prefixed with `_`
- Commits: conventional (`feat:`, `fix:`, `refactor:`)

## Environment

- `BACKEND_URL` (required) — FastAPI backend URL, server-side only (no `NEXT_PUBLIC_` prefix)
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` — Generate with `openssl rand -base64 32`

## Deployment

Two-container Docker Compose stack (Next.js + Nginx). Nginx handles TLS termination, rate limiting, security headers. Self-signed cert auto-generated if none exists. Deploy script supports `--rollback`, `--skip-build`, `--skip-pull`.

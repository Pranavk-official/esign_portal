# Copilot Instructions — ASP eSign Gateway Frontend

## Architecture

Next.js 16 App Router with **domain-driven route groups** and a Python/FastAPI backend (`NEXT_PUBLIC_API_BASE_URL`). Auth uses **HttpOnly cookies** — no tokens in JS/localStorage.

- **`(admin)/`** — Super Admin context (gateway operator). Components in `(admin)/_components/`.
- **`(portal)/`** — Portal Admin/User context (department manager). Components in `(portal)/_components/`.
- **`components/`** — Only context-agnostic shared UI (shadcn/ui `new-york` style, Radix primitives).

**Rule:** If a component fetches domain-specific data, it belongs in its route group's `_components/`, not `src/components/`.

## State Management (3 Layers — Don't Mix)

1. **Server state → React Query** (`src/hooks/use-*.ts`). Queries wrap API functions from `src/lib/api/`. Default staleTime: 1 min. Never put fetched data into Zustand.
2. **Client state → Zustand** (`src/lib/stores/`). Only for auth user (`useAuthStore`) and global UI. Read via selectors: `useAuthStore((s) => s.user)`.
3. **Form state → React Hook Form + Zod** (`src/lib/schemas/`). Schemas define both validation and inferred TS types: `z.infer<typeof schema>`.

## Error Handling (Centralized)

Mutation errors auto-toast via `QueryProvider`'s `MutationCache.onError`. Do NOT manually `try/catch` + `toast.error()` in mutation callbacks. Only define `onSuccess`.

To suppress the global toast for custom error handling (e.g., form field errors):
```ts
useMutation({ meta: { suppressErrorToast: true }, onError: (err) => form.setError(...) });
```

The Axios interceptor (`src/lib/api/client.ts`) maps HTTP status codes to typed `AppError` subclasses (`src/lib/errors.ts`) and handles 401 token refresh automatically.

## Auth Flow

- **Server guard:** `src/proxy.ts` — cookie-presence check, no JWT decryption.
- **Client guard:** `useRequireAuth({ requiredRoles: [ROLES.SUPER_ADMIN] })` in route group layouts.
- **User hydration:** `useCurrentUser()` calls `GET /users/me` → syncs Zustand store. Zustand is the canonical read source; React Query is the fetch/cache layer.
- **Roles:** Use constants from `src/lib/auth/roles.ts` (`ROLES.SUPER_ADMIN`, `ROLES.PORTAL_ADMIN`, `ROLES.PORTAL_USER`), never raw strings.

## API Layer Pattern

```
src/lib/api/<domain>.ts   → Axios calls, returns typed data (some Zod-validated at boundary)
src/lib/api/types.ts      → API response/request interfaces (PaginatedResponse<T>, query params)
src/hooks/use-<domain>.ts → useQuery wrappers (read)
src/hooks/use-<domain>-mutations.ts → useMutation wrappers (write)
```

Auth API (`src/lib/api/auth.ts`) validates every response through Zod `.parse()` at the boundary.

## Component Conventions

- Use `export function Name()` (named function declarations, not const arrows).
- Props: `interface NameProps {}` defined above the component.
- Files: `kebab-case.tsx`. Mark client components with `"use client"`.
- Icons: `lucide-react`. UI primitives: `@/components/ui/*` (shadcn).
- Import aliases: `@/components`, `@/lib`, `@/hooks`.

## Developer Workflow

- **Runtime:** Bun (`bun run dev`, `bun run build`, `bun run lint:fix`).
- **Formatting:** Prettier + `prettier-plugin-tailwindcss`. Run `bun run format`.
- **Import order** is enforced by `eslint-plugin-simple-import-sort` (React/Next → third-party → `@/components` → `@/lib` → local `./`).
- **Commits:** Conventional (`feat:`, `fix:`, `refactor:`).
- **No `any`** — use `unknown` + Zod validation. Unused vars prefixed with `_`.

## Key Files Reference

| Purpose | Path |
|---|---|
| API client + interceptors | `src/lib/api/client.ts` |
| Typed error classes | `src/lib/errors.ts` |
| Auth store (Zustand) | `src/lib/stores/auth-store.ts` |
| Role constants & helpers | `src/lib/auth/roles.ts` |
| Query key factory | `src/lib/auth/query-keys.ts` |
| Global error/toast wiring | `src/providers/query-provider.tsx` |
| Server-side route guard | `src/proxy.ts` |
| Zod form schemas | `src/lib/schemas/*.ts` |

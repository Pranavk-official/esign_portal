# ASP eSign Gateway Frontend

A modern, type-safe, multi-tenant frontend for the ASP eSign Gateway Service. Built with **Next.js 16**, **TypeScript**, and **Shadcn UI**.

## 🚀 Dev Quickstart

### Prerequisites
- **Bun** (v1.0+)
- Access to a running instance of the eSign API (FastAPI Backend)

### Setup

1.  **Install Dependencies**
    ```bash
    bun install
    ```

2.  **Environment Setup**
    Copy the example environment file. The defaults are configured for a standard local development environment.
    ```bash
    cp .env.example .env
    ```

3.  **Run Development Server**
    ```bash
    bun dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

4.  **Linting & Formatting**
    To ensure your code meets the project's strict standards:
    ```bash
    bun run lint      # Check for issues
    bun run format    # Fix formatting & sort imports automatically
    ```

---

## 📂 Project Structure

We use **Next.js 16 App Router** with **Route Groups** to strictly separate authentication contexts.

```text
src/
├── app/
│   ├── (auth)/                 # Public Authentication Routes
│   │   ├── login/              # Login Page
│   │   └── _components/        # Auth-specific components (LoginForm)
│   │
│   ├── (admin)/                # Gateway Operator (Super Admin) Context
│   │   ├── layout.tsx          # Admin Layout (Sidebar/Header)
│   │   └── admin/              # URL Prefix: /admin
│   │       ├── dashboard/      # /admin/dashboard
│   │       └── users/          # /admin/users
│   │
│   ├── (portal)/               # Department Manager (Portal Admin) Context
│   │   ├── layout.tsx          # Portal Layout
│   │   └── portal/             # URL Prefix: /portal
│   │       ├── dashboard/      # /portal/dashboard
│   │       └── api-keys/       # /portal/api-keys
│   │
│   └── error.tsx               # Global Error UI
│
├── components/
│   ├── ui/                     # Shadcn UI Primitives (Button, Input, etc.)
│   └── layout/                 # Shared Layout Components
│
├── lib/
│   ├── api/                    # Axios Client & API Definitions
│   ├── schemas/                # Zod Validation Schemas
│   ├── stores/                 # Zustand Global Stores
│   └── errors.ts               # Custom Error Classes
│
└── providers/                  # React Query & Context Providers
```

---

## ⚠️ Key Development Constraints

### 1. Authentication Strategy
* **Mechanism:** HttpOnly Cookies.
* **Storage:** We do **NOT** store tokens in `localStorage` or `Zustand`. The browser handles token storage automatically.
* **Flow:** Login → Verify OTP → **Fetch User Profile** → Redirect.
* **Security:** Routes are protected via Client Layouts and Server Middleware, but the API handles the final validation.

### 2. State Management Rules
* **Server State (Data):** Use **React Query** (`useQuery`, `useMutation`). Never store API data in global stores manually.
* **Client State (Auth/UI):** Use **Zustand** (`auth-store.ts`). Used for user profile and UI toggles only.
* **Form State:** Use **React Hook Form** + **Zod**.

### 3. Styling & UI
* **Component Library:** Use **Shadcn UI** for everything. Do not install other UI libraries unless absolutely necessary.
* **CSS:** Tailwind CSS only. No CSS modules or Styled Components.
* **Icons:** Lucide React.

### 4. Routing
* **Route Groups:** Always place pages inside their respective Route Group (`(admin)` or `(portal)`).
* **Colocation:** If a component is used *only* by the Admin dashboard, place it in `app/(admin)/_components`, not in `src/components`.

---

## 🧠 Core Dev Philosophy

### 1. "Fail Fast, Fail Loud" (Error Handling)
We do not use `try/catch` blocks inside UI components.
1.  **API Client:** Intercepts 4xx/5xx responses and **throws** custom `AppError` classes.
2.  **React Query:** Catches these errors globally via the `QueryProvider`.
3.  **UI Feedback:**
    * **Mutations (Writes):** Triggers an automatic **Toast Notification** with the error message.
    * **Queries (Reads):** Renders the `error.tsx` boundary or component-level error states.

### 2. Strict Typing & Schemas
We trust nothing.
* **API Inputs:** Validated via **Zod** before sending.
* **API Outputs:** Typed via interfaces in `src/lib/api`.
* **No `any`:** `tsconfig` is strict. Fix the types, don't bypass them.

### 3. Developer Experience (DX)
* **Imports:** We use `simple-import-sort` to keep file headers clean.
* **Unused Code:** The linter will warn you about unused variables. Prefix them with `_` if they are intentional (e.g., `_req`).


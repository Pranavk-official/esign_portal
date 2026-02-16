# 👨‍💻 Development Guidelines

This document outlines the coding standards, architectural patterns, and best practices for the ASP eSign Gateway Frontend. All contributors must adhere to these guidelines to ensure consistency and maintainability.

---

## 🏗️ Architecture Overview

We use a **Domain-Driven Design (DDD)** approach adapted for Next.js App Router. For a high-level view of the system components, see [**System Architecture**](./architecture.md).

### 1. Folder Structure

We strictly separate contexts using Route Groups.

- **`(admin)`**: Gateway Operator context. _Only_ components used by Super Admins go here.
- **`(portal)`**: Department Manager context. _Only_ components used by Portal Admins go here.
- **`components/`**: Truly shared UI primitives (Button, Input, Table) that are context-agnostic.

**Rule:** If a component fetches data specific to "Portals", it belongs in `app/(admin)/_components`, NOT `src/components`.

### 2. Authentication & Security

- **Mechanism:** HttpOnly Cookies (managed by backend).
- **Client State:** `useAuthStore` (Zustand) tracks _who_ is logged in, but not the _token_ itself.
- **Protection:**
  - **Middleware:** Checks for cookie presence on server-side.
  - **Layouts:** Checks for `user` object in Zustand on client-side.

**Rule:** Never try to read `localStorage` for tokens. Always rely on `authApi.getMe()` to verify session validity.

---

## ⚡ State Management Patterns

We use a 3-layer state strategy. Do not mix them up.

### 1. Server State (Data) -> React Query

Use `useQuery` for fetching and `useMutation` for changing data.

- **Stale Time:** Default is 1 minute.
- **Keys:** Use factory pattern if possible, or consistent strings: `['portals', 'list', { page: 1 }]`.

### 2. Client State (Global) -> Zustand

Use `useAuthStore` only for:

- User Profile
- Theme / UI Preferences
- Global Modals

### 3. Form State (Local) -> React Hook Form

- **Validation:** Zod Schemas (`src/lib/schemas`).
- **Submission:** `handleSubmit` calls a mutation.

**Rule:** Never put API data (like a list of users) into Zustand. Keep it in React Query cache.

---

## 🛡️ Error Handling Philosophy

We practice **"Centralized Error Handling"**. UI components should focus on the "Happy Path".

### How it works:

1.  **Interceptor:** `src/lib/api/client.ts` catches Axios errors and throws typed `AppError` (e.g., `BadRequestError`).
2.  **Global Listener:** `QueryProvider` listens for these errors.
    - **Mutations (Writes):** Automatically shows a `toast.error()` with the message.
    - **Queries (Reads):** Renders the nearest `error.tsx` boundary.

### Developer Workflow:

**❌ Bad:**

```tsx
try {
  await login(data);
} catch (err) {
  toast.error(err.message); // Don't do this manually!
}
```

**✅ Good:**

```tsx
const mutation = useMutation({
  mutationFn: login,
  onSuccess: () => toast.success("Welcome back!"),
  // onError is handled automatically by the provider
});
```

**Opt-Out:**
If you _need_ custom error handling (e.g., set a form error field), disable the global toast:

```tsx
useMutation({
  meta: { suppressErrorToast: true }, // 👈 Magic switch
  onError: (err) => form.setError("email", { message: err.message }),
});
```

**Throwing Custom Errors:**
If you need to throw an error manually in a utility or API function:

```tsx
import { BadRequestError } from "@/lib/errors";

if (!data) {
  throw new BadRequestError("Missing required data");
}
```

---

## 🐻 Using Zustand (Global Client State)

We use Zustand for client-side state that needs to persist across pages (e.g., Auth User).

### Consuming State

```tsx
import { useAuthStore } from "@/lib/stores/auth-store";

export function UserBadge() {
  // Selector pattern prevents unnecessary re-renders
  const user = useAuthStore((state) => state.user);

  if (!user) return null;
  return <span>{user.email}</span>;
}
```

### Updating State

```tsx
import { useAuthStore } from "@/lib/stores/auth-store";

export function LogoutButton() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return <button onClick={clearAuth}>Logout</button>;
}
```

### Creating a New Store

Only create a new store if you have complex global UI state (e.g., a multi-step wizard).

```tsx
// src/lib/stores/ui-store.ts
import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

---

## 🧩 Component Standards

Every component should follow this structure:

```tsx
// src/app/(admin)/_components/user-card.tsx
"use client"; // Only if using hooks

import { Button } from "@/components/ui/button"; // Shared UI first
import { type User } from "@/lib/schemas/user"; // Types second

// 1. Define Props Interface
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

// 2. Export named function
export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="rounded border p-4">
      <h3>{user.email}</h3>
      <Button onClick={() => onEdit(user.id)}>Edit</Button>
    </div>
  );
}
```

---

## 📋 Forms with Zod & React Hook Form

We use `zod` for validation and `react-hook-form` for state.

**1. Define Schema (`src/lib/schemas/auth.ts`)**

```tsx
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password too short"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

**2. Create Form Component**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  // 1. Initialize Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 2. Define Submit Handler
  function onSubmit(data: LoginFormValues) {
    // Call mutation here
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Field Wrapper */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                {/* Bind Input */}
                <Input placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage /> {/* Auto-displays Zod error */}
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}
```

---

## 📝 Coding Standards

### 1. Imports

We use `simple-import-sort`. Run `bun run format` to fix them.
Order:

1. React / Next.js
2. Third-party (TanStack, Lucide)
3. Shared Components (`@/components`)
4. Libs / Utils (`@/lib`)
5. Local Imports (`./`)

### 2. Types

- **No `any`:** Strictly forbidden. If the API response is dynamic, use `unknown` and validate it with Zod.
- **Interfaces:** Prefix with `I` is **not** required. Use descriptive names: `PortalResponse`, `UserCreateForm`.
- **API Types:** distinct from Domain Types. Define them in `src/lib/api/types.ts` or co-located files.

### 3. Components

- **Function Components:** Use `export function Name() {}` (not const arrow functions).
- **Props:** Define `interface Props` just above the component.
- **Filenames:** `kebab-case.tsx` (e.g., `user-profile-card.tsx`).

---

## 🚀 Committing Code

1.  **Lint First:**
    ```bash
    bun run lint --fix
    ```
2.  **Type Check:**
    Ensure `bun run build` doesn't fail.
3.  **Conventional Commits:**
    - `feat: add user creation dialog`
    - `fix: correct otp field name`
    - `refactor: move auth logic to hook`

---

## 🧪 Testing Strategy

- **Unit Tests:** For isolated logic (utils, form validation).
- **Integration Tests:** For critical flows (Login, Onboarding).
- **E2E:** (Future) Playwright for full browser testing.

**Rule:** If you fix a bug, write a test case that reproduces it first.

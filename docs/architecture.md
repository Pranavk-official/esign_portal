# System Architecture

## 1. Introduction

The **ASP eSign Gateway Frontend** is a modern, multi-tenant web application designed to interface with the C-DAC eSign services. It serves as the primary interface for:
- **Super Admins**: To manage portals (tenants), system-wide configurations, and monitor overall system health.
- **Portal Admins (Department Managers)**: To manage their specific department's users, API keys, and view usage analytics.
- **End Users**: To perform eSign operations (though primarily initiated via API).

The system is built with **Next.js 16 (App Router)** and emphasizes strict type safety, secure authentication, and a clear separation of concerns between server state and client UI state.

---

## 2. Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16** | React framework with App Router for routing and server-side rendering. |
| **Language** | **TypeScript 5** | Static typing for creating a robust and maintainable codebase. |
| **Runtime** | **Bun** | Fast JavaScript runtime and package manager. |
| **UI Library** | **React 19** | Component-based UI development. |
| **Components** | **Shadcn UI** | Accessible, reusable component primitives based on Radix UI. |
| **Styling** | **Tailwind CSS 4** | Utility-first CSS framework for rapid UI development. |
| **State (Server)** | **React Query (TanStack Query v5)** | Managing asynchronous server state (caching, fetching, updating). |
| **State (Client)** | **Zustand** | Lightweight global client state (e.g., user profile, UI toggles). |
| **Forms** | **React Hook Form** | Performant, flexible form validation. |
| **Validation** | **Zod** | Schema definition and validation for API responses and forms. |
| **HTTP Client** | **Axios** | Promise-based HTTP client with interceptors for global error handling. |
| **Icons** | **Lucide React** | Consistent and customizable icon set. |

---

## 3. System Architecture

The application follows a modular architecture dictated by the **Next.js App Router**, using **Route Groups** to strictly enforce context boundaries.

### 3.1. Routing & Route Groups

The `src/app` directory is organized into Route Groups to separate authentication contexts:

- **`(auth)`**: Public routes for authentication (e.g., `/login`). These pages use a dedicated layout optimized for authentication flows.
- **`(admin)`**: Protected routes for **Super Admins** (URL prefix: `/admin`). Contains sub-routes for portal management, system metrics, and user oversight.
- **`(portal)`**: Protected routes for **Portal Admins** (URL prefix: `/portal`). Contains sub-routes for API key management, department user management, and specific usage analytics.

Components specific to a route group are colocated within that group's directory (e.g., `(admin)/admin/_components`), ensuring that admin-specific logic doesn't leak into the portal context.

### 3.2. State Management Strategy

We strictly separate **Server State** (data from API) from **Client State** (UI/Auth state).

- **Server State (React Query)**:
  - All API data fetching is handled by React Query.
  - Custom hooks (e.g., `usePortals`, `useApiKeys`) encapsulate the query logic.
  - **Rule**: Never manually store API responses in a global store (like Redux or Zustand). Let React Query handle caching and invalidation.

- **Client State (Zustand)**:
  - Used *only* for truly global client-side state.
  - **`auth-store.ts`**: Stores the current user's profile and authentication status. This is the "single source of truth" for the UI to know *who* is logged in.
  - **Rule**: The auth store does *not* persist tokens (managed by cookies) and does *not* replace React Query for data fetching.

### 3.3. Authentication & Security

Authentication is handled securely using **HttpOnly Cookies**, adhering to OWASP best practices. The frontend **never** accesses raw JWT tokens.

**The Flow:**
1. **Login**: User enters email → OTP.
2. **Verification**: User verifies OTP.
3. **Session**: Backend sets `access_token` and `refresh_token` as HttpOnly cookies.
4. **Requests**: Browser automatically attaches these cookies to every API request (`withCredentials: true`).

**Token Refresh (Silent):**
- An **Axios Interceptor** monitors for `401 Unauthorized` responses.
- If a 401 occurs, it pauses the request and calls the `/refresh` endpoint.
- If refresh succeeds: The original request is retried with the new session.
- If refresh fails: The interceptor triggers a "session expired" event, clearing the Zustand store and redirecting to login.

### 3.4. Error Handling Architecture

The application implements a "Fail Fast, Fail Loud" strategy for errors, centralized through the API client and Query Provider.

1. **API Client (`client.ts`)**:
   - Intercepts all error responses.
   - Maps HTTP status codes (e.g., 400, 403, 404) to typed `AppError` subclasses (e.g., `BadRequestError`, `ForbiddenError`).
2. **Query Provider (`query-provider.tsx`)**:
   - A global `MutationCache` listener catches errors from all mutations.
   - Automatically displays a **Toast Notification** (via Sonner) with the error message.
   - This removes the need for `try/catch` blocks in individual components.

---

## 4. Data Flow

```mermaid
graph TD
    User[User Interaction] --> Component[React Component]
    
    subgraph "Client Side"
        Component -->|Form Data| Zod[Zod Validation]
        Component -->|Read| RQ[React Query (Cache)]
        Component -->|Write| Mutation[React Query Mutation]
        
        Mutation -->|API Call| Axios[Axios Client]
        RQ -->|API Call| Axios
        
        Axios -->|Interceptor| AuthHandler[Auth Handler]
        AuthHandler -->|On 401| Refresh[Refresh Logic]
        
        Store[Zustand Auth Store] -->|User Profile| Component
    end
    
    subgraph "Server Side"
        Axios -->|HttpOnly Cookies| API[Backend API]
        API -->|JSON| Axios
    end
```

---

## 5. Directory Structure Overview

```text
src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (admin)/          # Super Admin Routes
│   ├── (auth)/           # Authentication Routes
│   ├── (portal)/         # Portal Admin Routes
│   └── layout.tsx        # Root Layout (Providers)
├── components/           # Shared UI Components
│   └── ui/               # Shadcn UI Primitives
├── lib/                  # Core Logic & Utilities
│   ├── api/              # API Definitions & Client
│   ├── schemas/          # Zod Validation Schemas
│   ├── stores/           # Zustand Stores
│   └── utils.ts          # Helper Functions
└── providers/            # React Context Providers
```

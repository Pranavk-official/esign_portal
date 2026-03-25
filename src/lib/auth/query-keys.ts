/**
 * Query Key Factory — centralised key definitions for React Query.
 *
 * Using a factory ensures type-safe, collision-free cache keys and makes
 * targeted invalidation straightforward (e.g. `queryClient.invalidateQueries({ queryKey: authKeys.me() })`).
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

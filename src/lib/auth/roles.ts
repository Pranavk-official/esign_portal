import type { UserDetailResponse, RoleResponse } from "@/lib/api/auth";

export type RoleName = "super_admin" | "portal_admin" | "portal_user";

export const ROLES = {
    SUPER_ADMIN: "super_admin",
    PORTAL_ADMIN: "portal_admin",
    PORTAL_USER: "portal_user",
} as const;

/**
 * Check if a user has at least one of the required roles.
 */
export function hasRole(user: UserDetailResponse, requiredRoles: RoleName[]): boolean {
    if (!user.roles) return false;
    return user.roles.some((userRole: RoleResponse) => requiredRoles.includes(userRole.name as RoleName));
}

/**
 * Get the default redirect path for a user based on their highest role.
 * Priority: super_admin > portal_admin > portal_user
 */
export function getRedirectPath(user: UserDetailResponse): string {
    if (hasRole(user, ["super_admin"])) {
        return "/admin/dashboard";
    }

    if (hasRole(user, ["portal_admin", "portal_user"])) {
        return "/portal/dashboard";
    }

    return "/";
}

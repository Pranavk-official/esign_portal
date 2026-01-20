/**
 * Authentication & Authorization Utilities
 * 
 * This module provides helper functions for role-based access control (RBAC).
 */

import { UserDetailResponse } from '@/lib/api/types';

export enum UserRoleName {
  SUPER_ADMIN = 'super_admin',
  PORTAL_ADMIN = 'portal_admin',
  PORTAL_USER = 'portal_user'
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: UserDetailResponse | null, roleName: UserRoleName | string): boolean {
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => 
    typeof role === 'string' ? role === roleName : role.name === roleName
  );
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserDetailResponse | null, roleNames: (UserRoleName | string)[]): boolean {
  if (!user || !user.roles) return false;
  
  return roleNames.some(roleName => hasRole(user, roleName));
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: UserDetailResponse | null): boolean {
  return hasRole(user, UserRoleName.SUPER_ADMIN);
}

/**
 * Check if user is a portal admin (department manager)
 */
export function isPortalAdmin(user: UserDetailResponse | null): boolean {
  return hasRole(user, UserRoleName.PORTAL_ADMIN);
}

/**
 * Check if user is a regular portal user
 */
export function isUser(user: UserDetailResponse | null): boolean {
  return hasRole(user, UserRoleName.PORTAL_USER);
}

/**
 * Get the appropriate redirect path based on user role
 */
export function getRedirectPathForUser(user: UserDetailResponse | null): string {
  if (!user) return '/login';
  
  if (isSuperAdmin(user)) {
    return '/admin';
  }
  
  if (isPortalAdmin(user) || isUser(user)) {
    return '/portal';
  }
  
  // Default fallback
  return '/portal';
}

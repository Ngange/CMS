/**
 * Role name constants
 * Used throughout the application to avoid hardcoding role names
 */
export const ROLE_NAMES = {
  SUPER_ADMIN: 'SuperAdmin',
  MANAGER: 'Manager',
  CONTRIBUTOR: 'Contributor',
  VIEWER: 'Viewer'
} as const;

/**
 * Resource names for permissions
 */
export const RESOURCE_NAMES = {
  USER: 'user',
  ROLE: 'role',
  ARTICLE: 'article'
} as const;

/**
 * Action names for permissions
 */
export const ACTION_NAMES = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish'
} as const;

/**
 * Permission format helper
 * Usage: `getPermissionString(RESOURCE_NAMES.ARTICLE, ACTION_NAMES.CREATE)`
 */
export function getPermissionString(resource: string, action: string): string {
  return `${resource}:${action}`;
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type Permission = 
  | 'board:create'
  | 'board:edit'
  | 'board:delete'
  | 'board:view'
  | 'card:create'
  | 'card:edit'
  | 'card:delete'
  | 'card:view'
  | 'user:manage'
  | 'user:view'
  | 'settings:manage'
  | 'reports:view'
  | 'reports:create'
  | 'meetings:create'
  | 'meetings:edit'
  | 'meetings:delete'
  | 'meetings:view'
  | 'templates:create'
  | 'templates:edit'
  | 'templates:delete'
  | 'templates:view';

export type Role = 'admin' | 'manager' | 'member' | 'viewer';

interface RolePermissions {
  [key: string]: Permission[];
}

const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'board:create', 'board:edit', 'board:delete', 'board:view',
    'card:create', 'card:edit', 'card:delete', 'card:view',
    'user:manage', 'user:view',
    'settings:manage',
    'reports:view', 'reports:create',
    'meetings:create', 'meetings:edit', 'meetings:delete', 'meetings:view',
    'templates:create', 'templates:edit', 'templates:delete', 'templates:view'
  ],
  manager: [
    'board:create', 'board:edit', 'board:view',
    'card:create', 'card:edit', 'card:delete', 'card:view',
    'user:view',
    'reports:view', 'reports:create',
    'meetings:create', 'meetings:edit', 'meetings:view',
    'templates:create', 'templates:edit', 'templates:view'
  ],
  member: [
    'board:view',
    'card:create', 'card:edit', 'card:view',
    'meetings:view',
    'templates:view'
  ],
  viewer: [
    'board:view',
    'card:view',
    'meetings:view'
  ]
};

interface PermissionContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserRole: () => Role;
  getUserPermissions: () => Permission[];
  canAccessFeature: (feature: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const getUserRole = useCallback((): Role => {
    return (user?.role as Role) || 'viewer';
  }, [user]);

  const getUserPermissions = useCallback((): Permission[] => {
    const role = getUserRole();
    return ROLE_PERMISSIONS[role] || [];
  }, [getUserRole]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission);
  }, [getUserPermissions]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const canAccessFeature = useCallback((feature: string): boolean => {
    const featurePermissions: { [key: string]: Permission[] } = {
      'kanban-boards': ['board:view'],
      'create-board': ['board:create'],
      'edit-board': ['board:edit'],
      'delete-board': ['board:delete'],
      'create-card': ['card:create'],
      'edit-card': ['card:edit'],
      'delete-card': ['card:delete'],
      'user-management': ['user:manage'],
      'settings': ['settings:manage'],
      'reports': ['reports:view'],
      'meetings': ['meetings:view'],
      'create-meeting': ['meetings:create'],
      'edit-meeting': ['meetings:edit'],
      'delete-meeting': ['meetings:delete'],
      'templates': ['templates:view'],
      'create-template': ['templates:create'],
      'edit-template': ['templates:edit'],
      'delete-template': ['templates:delete']
    };

    const requiredPermissions = featurePermissions[feature] || [];
    return hasAnyPermission(requiredPermissions);
  }, [hasAnyPermission]);

  const value: PermissionContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    getUserPermissions,
    canAccessFeature
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

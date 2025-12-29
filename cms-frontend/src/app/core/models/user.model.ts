// Define Role interface first to avoid circular dependency
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'publish')[];
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  profilePhoto?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

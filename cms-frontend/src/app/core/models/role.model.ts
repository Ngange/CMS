export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  isSystemRole?: boolean;
}

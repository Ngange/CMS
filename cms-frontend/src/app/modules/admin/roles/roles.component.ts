import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { Role, Permission } from '../../../core/models/role.model';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  systemRoles: Role[] = [];
  customRoles: Role[] = [];
  roleForm: FormGroup;
  isCreating = false;
  isLoading = false;
  selectedRole: Role | null = null;

  // Available permissions
  resources = ['user', 'role', 'article'];
  actions = ['create', 'read', 'update', 'delete', 'publish'];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.systemRoles = roles.filter(role => role.isSystemRole);
        this.customRoles = roles.filter(role => !role.isSystemRole);
      }
    });
  }

  startCreating(): void {
    this.isCreating = true;
    this.selectedRole = null;
    this.roleForm.reset();
    this.initializePermissions();
  }

  initializePermissions(): void {
    const permissionsArray = this.roleForm.get('permissions') as any;
    permissionsArray.clear();

    this.resources.forEach(resource => {
      const resourceGroup = this.fb.group({
        resource: [resource],
        actions: this.fb.array(this.actions.map(() => this.fb.control(false)))
      });
      permissionsArray.push(resourceGroup);
    });
  }

  onEditRole(role: Role): void {
    this.selectedRole = role;
    this.isCreating = true;

    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });

    this.setPermissions(role.permissions);
  }

  setPermissions(permissions: Permission[]): void {
    const permissionsArray = this.roleForm.get('permissions') as any;
    permissionsArray.clear();

    this.resources.forEach(resource => {
      const resourcePermissions = permissions.find(p => p.resource === resource);
      const actionsArray = this.actions.map(action =>
        this.fb.control(resourcePermissions?.actions.includes(action as any) || false)
      );

      const resourceGroup = this.fb.group({
        resource: [resource],
        actions: this.fb.array(actionsArray)
      });

      permissionsArray.push(resourceGroup);
    });
  }

  getPermissions(): any[] {
    const permissions: any[] = [];
    const permissionsArray = this.roleForm.get('permissions') as any;

    permissionsArray.controls.forEach((resourceGroup: any) => {
      const resource = resourceGroup.get('resource').value;
      const selectedActions = this.actions.filter((_, index) =>
        resourceGroup.get('actions').controls[index].value
      );

      if (selectedActions.length > 0) {
        permissions.push({
          resource,
          actions: selectedActions
        });
      }
    });

    return permissions;
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.isLoading = true;

      const roleData = {
        name: this.roleForm.get('name')?.value,
        description: this.roleForm.get('description')?.value,
        permissions: this.getPermissions(),
        isSystemRole: false
      };

      if (this.selectedRole) {
        // Update existing role
        this.roleService.updateRole(this.selectedRole._id, roleData).subscribe({
          next: () => {
            this.resetForm();
            this.loadRoles();
          },
          error: () => {
            this.isLoading = false;
          }
        });
      } else {
        // Create new role
        this.roleService.createRole(roleData).subscribe({
          next: () => {
            this.resetForm();
            this.loadRoles();
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    }
  }

  resetForm(): void {
    this.isCreating = false;
    this.selectedRole = null;
    this.isLoading = false;
    this.roleForm.reset();
  }

  canEditRole(role: Role): boolean {
    return !role.isSystemRole;
  }
}

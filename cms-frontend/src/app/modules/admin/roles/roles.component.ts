import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RoleService } from '../../../core/services/role.service';
import { Permission, Role } from '../../../core/models/role.model';
import { AuthService } from '../../../core/services/auth.service';

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
  selectedRole: Role | null = null;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  confirmDeleteId: string | null = null;

  // Resources and actions available in the system
  resources = ['user', 'role', 'article'];
  actions = ['create', 'read', 'update', 'delete', 'publish'];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private authService: AuthService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initializePermissions();
    this.loadRoles();
  }

  get permissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'create': 'add_circle',
      'read': 'visibility',
      'update': 'edit',
      'delete': 'delete_forever',
      'publish': 'publish'
    };
    return icons[action] || 'check_circle';
  }

  getActionColor(action: string): 'primary' | 'accent' | 'warn' {
    const colors: { [key: string]: 'primary' | 'accent' | 'warn' } = {
      'create': 'primary',
      'read': 'accent',
      'update': 'warn',
      'delete': 'warn',
      'publish': 'primary'
    };
    return colors[action] || 'accent';
  }

  getActionsControls(index: number): FormControl[] {
    return (this.permissionsArray.at(index).get('actions') as FormArray).controls as FormControl[];
  }

  getResourceName(index: number): string {
    return this.permissionsArray.at(index).get('resource')?.value;
  }

  loadRoles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.systemRoles = roles.filter(role => role.isSystemRole);
        this.customRoles = roles.filter(role => !role.isSystemRole);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load roles';
        this.isLoading = false;
      }
    });
  }

  get canCreate(): boolean {
    return this.authService.hasPermission('role', 'create');
  }

  get canUpdate(): boolean {
    return this.authService.hasPermission('role', 'update');
  }

  get canDelete(): boolean {
    return this.authService.hasPermission('role', 'delete');
  }

  initializePermissions(): void {
    this.permissionsArray.clear();
    this.resources.forEach(resource => {
      const actionsArray = this.actions.map(() => this.fb.control(false));
      this.permissionsArray.push(
        this.fb.group({
          resource: [resource],
          actions: this.fb.array(actionsArray)
        })
      );
    });
  }

  startCreate(): void {
    this.selectedRole = null;
    this.roleForm.reset();
    this.initializePermissions();
    this.successMessage = '';
    this.errorMessage = '';
    this.confirmDeleteId = null;
  }

  editRole(role: Role): void {
    if (role.isSystemRole) {
      return; // System roles are read-only
    }
    this.selectedRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.setPermissions(role.permissions || []);
    this.successMessage = '';
    this.errorMessage = '';
    this.confirmDeleteId = null;
  }

  setPermissions(permissions: Permission[]): void {
    this.permissionsArray.clear();

    this.resources.forEach(resource => {
      const resourcePermissions = permissions.find(p => p.resource === resource);
      const actionsArray = this.actions.map(action =>
        this.fb.control(resourcePermissions?.actions?.includes(action as any) || false)
      );

      this.permissionsArray.push(
        this.fb.group({
          resource: [resource],
          actions: this.fb.array(actionsArray)
        })
      );
    });
  }

  private buildPermissionsPayload(): Permission[] {
    const payload: Permission[] = [];

    this.permissionsArray.controls.forEach((group: any) => {
      const resource = group.get('resource').value;
      const selectedActions = this.actions.filter((_, index) =>
        group.get('actions').controls[index].value
      );

      if (selectedActions.length > 0) {
        payload.push({ resource, actions: selectedActions as any });
      }
    });

    return payload;
  }

  submit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    // Permission gate
    if (!this.selectedRole && !this.canCreate) {
      this.errorMessage = 'You do not have permission to create roles.';
      return;
    }
    if (this.selectedRole && !this.canUpdate) {
      this.errorMessage = 'You do not have permission to update roles.';
      return;
    }

    const roleData: Partial<Role> = {
      name: this.roleForm.get('name')?.value,
      description: this.roleForm.get('description')?.value,
      permissions: this.buildPermissionsPayload(),
      isSystemRole: false
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.selectedRole
      ? this.roleService.updateRole(this.selectedRole._id, roleData as Role)
      : this.roleService.createRole(roleData as Role);

    request$
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.successMessage = this.selectedRole ? 'Role updated' : 'Role created';
          this.startCreate();
          this.loadRoles();
        },
        error: () => {
          this.errorMessage = this.selectedRole ? 'Failed to update role' : 'Failed to create role';
        }
      });
  }

  requestDelete(role: Role): void {
    if (role.isSystemRole || this.isSaving) {
      return; // Prevent deleting system roles or concurrent ops
    }

    if (!this.canDelete) {
      this.errorMessage = 'You do not have permission to delete roles.';
      return;
    }

    // First click toggles confirm UI
    if (this.confirmDeleteId !== role._id) {
      this.confirmDeleteId = role._id;
      this.successMessage = '';
      this.errorMessage = '';
      return;
    }

    // Second click confirms deletion
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.roleService.deleteRole(role._id)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Role deleted';
          this.confirmDeleteId = null;
          this.loadRoles();
        },
        error: () => {
          this.errorMessage = 'Failed to delete role';
          this.confirmDeleteId = null;
        }
      });
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  canEditRole(role: Role): boolean {
    return !role.isSystemRole;
  }
}

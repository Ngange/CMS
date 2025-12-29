import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  roles: Role[] = [];
  systemRoles: Role[] = [];
  customRoles: Role[] = [];
  isLoading = true;

  constructor(private roleService: RoleService) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.systemRoles = roles.filter(role => role.isSystemRole);
        this.customRoles = roles.filter(role => !role.isSystemRole);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'create': 'primary',
      'read': 'accent',
      'update': 'warn',
      'delete': 'warn',
      'publish': 'primary'
    };
    return colors[action] || 'default';
  }

  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'create': 'add',
      'read': 'visibility',
      'update': 'edit',
      'delete': 'delete',
      'publish': 'publish'
    };
    return icons[action] || 'code';
  }
}

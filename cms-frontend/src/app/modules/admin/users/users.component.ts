import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';

  constructor(
    private userService: UserService,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Role filter
      if (this.roleFilter !== 'all' && user.role._id !== this.roleFilter) {
        return false;
      }

      // Status filter
      if (this.statusFilter !== 'all') {
        const isActive = this.statusFilter === 'active';
        if (user.isActive !== isActive) {
          return false;
        }
      }

      // Search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return (
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.name.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.isActive;
    this.userService.toggleUserStatus(user._id, newStatus).subscribe({
      next: () => {
        user.isActive = newStatus;
      }
    });
  }

  updateUserRole(user: User, roleId: string): void {
    this.userService.updateUser(user._id, { role: roleId }).subscribe({
      next: (updatedUser) => {
        user.role = updatedUser.role;
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u._id !== user._id);
          this.applyFilters();
        }
      });
    }
  }

  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r._id === roleId);
    return role ? role.name : 'Unknown';
  }
}

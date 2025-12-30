import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserEditDialogComponent } from './user-edit-dialog/user-edit-dialog.component';

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
  displayedColumns: string[] = ['fullName', 'email', 'role', 'status', 'actions'];

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.isLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
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
      },
      error: (error) => {
        console.error('Failed to toggle user status:', error);
      }
    });
  }

  updateUserRole(user: User, roleId: string): void {
    this.userService.updateUser(user._id, { role: roleId }).subscribe({
      next: (updatedUser) => {
        user.role = updatedUser.role;
      },
      error: (error) => {
        console.error('Failed to update user role:', error);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u._id !== user._id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
        }
      });
    }
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
      data: { user: { ...user }, roles: this.roles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user._id, result).subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u._id === user._id);
            if (index !== -1) {
              this.users[index] = updatedUser;
              this.applyFilters();
            }
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Failed to update user:', error);
            const errorMsg = error.error?.message || 'Failed to update user';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r._id === roleId);
    return role ? role.name : 'Unknown';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'success' : 'warn';
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'check_circle' : 'cancel';
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  // Navigation items based on role
  getNavItems(): any[] {
    const items = [
      { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      { label: 'Articles', route: '/articles', icon: 'article' }
    ];

    // Add admin items for SuperAdmin
    if (this.currentUser?.role.name === 'SuperAdmin') {
      items.push(
        { label: 'Users', route: '/admin/users', icon: 'people' },
        { label: 'Roles', route: '/admin/roles', icon: 'admin_panel_settings' }
      );
    }

    // Add manager items
    if (this.currentUser?.role.name === 'Manager') {
      items.push(
        { label: 'Access Matrix', route: '/admin/access-matrix', icon: 'grid_view' }
      );
    }

    return items;
  }
}

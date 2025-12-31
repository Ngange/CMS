import { ChangeDetectionStrategy, Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { User } from '../../../core/models/user.model';
import { ROLE_NAMES } from '../../../core/constants/roles.constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  currentUser$: Observable<User | null> = this.authService.currentUser$;
  navItems$: Observable<NavItem[]> = this.authService.currentUser$.pipe(
    map(user => this.buildNavItems(user))
  );
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private articleService: ArticleService,
    private elementRef: ElementRef
  ) { }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close menu when clicking outside the navbar
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isMenuOpen = false;
      return;
    }
  }

  onLinkClick(): void {
    this.isMenuOpen = false;
  }

  getImageUrl(imagePath: string | undefined): string | null {
    return imagePath ? this.articleService.getImageUrl(imagePath) : null;
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  logout(): void {
    this.onLinkClick();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  // Navigation items based on role
  private buildNavItems(user: User | null): NavItem[] {
    const items: NavItem[] = [
      { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      { label: 'Articles', route: '/articles', icon: 'article' }
    ];

    // Add admin items for SuperAdmin
    if (user?.role.name === ROLE_NAMES.SUPER_ADMIN) {
      items.push(
        { label: 'Users', route: '/admin/users', icon: 'people' },
        { label: 'Roles', route: '/admin/roles', icon: 'admin_panel_settings' },
        { label: 'Permissions', route: '/admin/permissions', icon: 'security' }
      );
    }

    // Add manager items
    if (user?.role.name === ROLE_NAMES.MANAGER) {
      items.push(
        { label: 'Permissions', route: '/admin/permissions', icon: 'security' }
      );
    }

    return items;
  }

  trackByRoute(_index: number, item: NavItem): string {
    return item.route;
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Role-Based CMS';
  showNavbar = true;
  showFooter = true;

  // Pages where navbar and footer should be hidden
  private hideLayoutPages = ['/login', '/register'];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to show/hide navbar and footer
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.showNavbar = !this.hideLayoutPages.some(page => url.startsWith(page));
      this.showFooter = !this.hideLayoutPages.some(page => url.startsWith(page));
    });

    // Auto-refresh token on app initialization
    this.setupTokenRefresh();
  }

  private setupTokenRefresh(): void {
    const accessToken = this.authService.getAccessToken();
    const refreshToken = this.authService.getRefreshToken();

    if (accessToken && refreshToken) {
      // Check if token is about to expire (e.g., within 5 minutes)
      // You can decode the JWT to check expiration time
      // For simplicity, we'll just refresh on app start if tokens exist
      this.authService.getProfile().subscribe({
        error: () => {
          // Token might be expired, try to refresh
          this.authService.refreshToken().subscribe({
            error: () => {
              // Refresh failed, logout user
              this.authService.logout().subscribe();
            }
          });
        }
      });
    }
  }
}

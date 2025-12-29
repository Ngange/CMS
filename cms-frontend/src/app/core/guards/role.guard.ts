import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(requiredRole: string): boolean {
    const user = this.authService.getCurrentUser();

    if (user && user.role.name === requiredRole) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}

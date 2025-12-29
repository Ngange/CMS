import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(resource: string, action: string): boolean {
    if (this.authService.hasPermission(resource, action)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}

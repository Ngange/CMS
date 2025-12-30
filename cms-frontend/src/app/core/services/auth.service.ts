import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
          return response;
        })
      );
  }

  register(registerData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      .pipe(
        map(response => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
          return response;
        })
      );
  }

  logout(): Observable<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    return of(void 0);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getAccessToken(): string | null {
    return this.getToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  refreshAccessToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        map(response => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            if (response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
              this.currentUserSubject.next(response.user);
            }
          }
          return response;
        })
      );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }

    return user.role.permissions.some(permission =>
      permission.resource === resource &&
      permission.actions.includes(action as any)
    );
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.name === roleName;
  }

  getSystemRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/system-roles`);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
      map(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/change-password`, passwordData);
  }

  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        return null;
      }
      const user = JSON.parse(userJson);
      // Validate that we have a valid user object
      if (!user || !user._id || !user.email) {
        console.warn('Invalid user data in localStorage, clearing...');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setTokens(response.tokens);
          this.setCurrentUser(response.user);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearStorage();
        this.currentUserSubject.next(null);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string; expiresIn: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string; expiresIn: string }>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/profile`);
  }

  updateProfile(userData: any): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/profile`, userData)
      .pipe(
        tap(user => this.setCurrentUser(user))
      );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/profile/change-password`, passwordData);
  }

  private setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.currentUserSubject.value;
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role.name === roleName;
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.role?.permissions) return false;

    return user.role.permissions.some(permission =>
      permission.resource === resource &&
      permission.actions.includes(action as any)
    );
  }
}

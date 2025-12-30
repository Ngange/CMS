import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: string, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { isActive });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

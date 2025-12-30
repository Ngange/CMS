import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }
}

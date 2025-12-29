import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  createRole(roleData: any): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, roleData);
  }

  updateRole(id: string, roleData: any): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, roleData);
  }
}

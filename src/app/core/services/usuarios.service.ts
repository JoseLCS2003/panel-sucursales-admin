import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Role } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/usuarios/${id}`);
  }

  createUsuario(usuario: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }
}

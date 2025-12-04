import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces
export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role_id: number;
  sucursal_id?: number;
  role?: Role;
  negocio?: Negocio;
}

export interface Role {
  id: number;
  nombre: string;
}

export interface Negocio {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  capacidad: number;
  estado: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private token: string | null = null;

  constructor(private http: HttpClient) {
    // Cargar token del localStorage si existe
    this.token = localStorage.getItem('auth_token');
  }

  // Headers con autenticación
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return headers;
  }

  // ==================== AUTENTICACIÓN ====================

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  verify2FA(email: string, code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/verify-2fa`, {
      email,
      code,
    });
  }

  resend2FA(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/resend-2fa`, { email });
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  logout(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers });
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getMe(): Observable<User> {
    const headers = this.getHeaders();
    return this.http.get<User>(`${this.apiUrl}/me`, { headers });
  }

  // ==================== SUCURSALES / NEGOCIOS ====================

  getSucursales(): Observable<Negocio[]> {
    const headers = this.getHeaders();
    return this.http.get<Negocio[]>(`${this.apiUrl}/negocios`, { headers });
  }

  getSucursal(id: number): Observable<Negocio> {
    const headers = this.getHeaders();
    return this.http.get<Negocio>(`${this.apiUrl}/negocios/${id}`, { headers });
  }

  createSucursal(sucursal: Negocio): Observable<Negocio> {
    const headers = this.getHeaders();
    return this.http.post<Negocio>(`${this.apiUrl}/negocios`, sucursal, {
      headers,
    });
  }

  updateSucursal(id: number, sucursal: Partial<Negocio>): Observable<Negocio> {
    const headers = this.getHeaders();
    return this.http.put<Negocio>(`${this.apiUrl}/negocios/${id}`, sucursal, {
      headers,
    });
  }

  deleteSucursal(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/negocios/${id}`, { headers });
  }

  // ==================== USUARIOS (Clientes y Empleados) ====================

  getUsuarios(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`, { headers });
  }

  getUsuario(id: number): Observable<User> {
    const headers = this.getHeaders();
    return this.http.get<User>(`${this.apiUrl}/usuarios/${id}`, { headers });
  }

  createUsuario(usuario: User): Observable<User> {
    const headers = this.getHeaders();
    return this.http.post<User>(`${this.apiUrl}/usuarios`, usuario, {
      headers,
    });
  }

  updateUsuario(id: number, usuario: Partial<User>): Observable<User> {
    const headers = this.getHeaders();
    return this.http.put<User>(`${this.apiUrl}/usuarios/${id}`, usuario, {
      headers,
    });
  }

  deleteUsuario(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`, { headers });
  }

  // Filtrar usuarios por rol
  getClientes(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`, { headers });
    // Nota: Filtraremos en el componente por role_id
  }

  getEmpleados(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`, { headers });
    // Nota: Filtraremos en el componente por role_id
  }

  // ==================== ROLES ====================

  getRoles(): Observable<Role[]> {
    const headers = this.getHeaders();
    // Asumiendo que existe este endpoint, si no, lo crearemos
    return this.http.get<Role[]>(`${this.apiUrl}/roles`, { headers });
  }
}

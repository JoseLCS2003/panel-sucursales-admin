import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Negocio } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SucursalesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSucursales(): Observable<Negocio[]> {
    return this.http.get<Negocio[]>(`${this.apiUrl}/negocios`);
  }

  getSucursal(id: number): Observable<Negocio> {
    return this.http.get<Negocio>(`${this.apiUrl}/negocios/${id}`);
  }

  createSucursal(sucursal: Negocio): Observable<Negocio> {
    return this.http.post<Negocio>(`${this.apiUrl}/negocios`, sucursal);
  }

  updateSucursal(id: number, sucursal: Partial<Negocio>): Observable<Negocio> {
    return this.http.put<Negocio>(`${this.apiUrl}/negocios/${id}`, sucursal);
  }

  deleteSucursal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/negocios/${id}`);
  }
}

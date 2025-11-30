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
  requires_2fa?: boolean;
}

# Panel Administrativo de Sucursales - Integración con API

## 🚀 Actualización: Integración Completa con API Laravel

El panel ahora está completamente integrado con la API Laravel del sistema de gestión de turnos.

### ✨ Nuevas Funcionalidades

#### 1. **Autenticación Real con API**

- Login con credenciales de la base de datos
- Token JWT para sesiones seguras
- Logout con limpieza de sesión

#### 2. **CRUD Completo de Sucursales**

- ✅ Listar sucursales desde la API
- ✅ Crear nueva sucursal
- ✅ Editar sucursal existente
- ✅ Eliminar sucursal
- ✅ Ver detalles de sucursal

#### 3. **CRUD Completo de Clientes**

- ✅ Listar todos los clientes (usuarios con role_id = 3)
- ✅ Crear nuevo cliente
- ✅ Editar cliente existente
- ✅ Eliminar cliente
- ✅ Ver detalles de cliente

#### 4. **CRUD Completo de Empleados**

- ✅ Listar todos los empleados (usuarios con role_id = 2)
- ✅ Crear nuevo empleado/agente
- ✅ Editar empleado existente
- ✅ Eliminar empleado
- ✅ Ver detalles de empleado

### 📡 Endpoints Utilizados

El panel consume los siguientes endpoints de la API:

```
Base URL: http://localhost:8000/api

Autenticación:
- POST /login
- POST /logout
- GET /me

Sucursales:
- GET /negocios
- POST /negocios
- GET /negocios/{id}
- PUT /negocios/{id}
- DELETE /negocios/{id}

Usuarios (Clientes y Empleados):
- GET /usuarios
- POST /usuarios
- GET /usuarios/{id}
- PUT /usuarios/{id}
- DELETE /usuarios/{id}
```

### 🔧 Configuración

#### 1. Iniciar la API Laravel

Primero, asegúrate de que la API Laravel esté corriendo:

```bash
cd gestor-turnos-api
php artisan serve
```

La API debería estar disponible en `http://localhost:8000`

#### 2. Iniciar el Panel Angular

```bash
cd panel-sucursales-admin
npm start
```

El panel estará disponible en `http://localhost:4200`

### 🔐 Credenciales de Prueba

Usa las credenciales de un usuario administrador de tu base de datos:

```
Email: admin@ejemplo.com
Contraseña: [tu contraseña]
```

### 📊 Estructura de Datos

#### Sucursal (Negocio)

```typescript
interface Negocio {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  capacidad: number;
  estado: string; // 'activa' | 'inactiva'
}
```

#### Usuario (Cliente/Empleado)

```typescript
interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role_id: number; // 1=admin, 2=empleado, 3=cliente
  sucursal_id?: number;
  role?: Role;
  negocio?: Negocio;
}
```

### 🎯 Funcionalidades por Sección

#### Panel Sucursales

- Vista de tarjetas con estadísticas en tiempo real
- Tabla con todas las sucursales de la base de datos
- Botones de acción para editar y eliminar
- Botón para crear nueva sucursal

#### Clientes

- Lista de todos los usuarios con role_id = 3
- Información completa: nombre, email, sucursal asignada
- CRUD completo con formularios modales
- Filtrado y búsqueda

#### Empleados

- Lista de todos los usuarios con role_id = 2
- Información completa: nombre, email, rol, sucursal
- CRUD completo con formularios modales
- Asignación de sucursales

### 🛠️ Servicios Implementados

#### ApiService

Servicio centralizado que maneja todas las peticiones HTTP:

```typescript
// Autenticación
login(email, password);
logout();
setToken(token);
clearToken();
getMe();

// Sucursales
getSucursales();
getSucursal(id);
createSucursal(sucursal);
updateSucursal(id, sucursal);
deleteSucursal(id);

// Usuarios
getUsuarios();
getUsuario(id);
createUsuario(usuario);
updateUsuario(id, usuario);
deleteUsuario(id);
getClientes();
getEmpleados();
```

### 📝 Notas Importantes

1. **CORS**: Asegúrate de que la API Laravel tenga configurado CORS para aceptar peticiones desde `http://localhost:4200`

2. **Tokens**: Los tokens se guardan en `localStorage` para mantener la sesión

3. **Roles**:

   - 1 = Administrador
   - 2 = Empleado/Agente
   - 3 = Cliente

4. **Estados de Sucursal**:
   - 'activa' = Sucursal operativa
   - 'inactiva' = Sucursal cerrada o en mantenimiento

### 🚧 Próximas Mejoras

- [ ] Formularios modales para crear/editar
- [ ] Validación de formularios
- [ ] Paginación de tablas
- [ ] Filtros y búsqueda avanzada
- [ ] Exportación de datos (PDF, Excel)
- [ ] Gráficos en la sección de Estadísticas
- [ ] Notificaciones toast
- [ ] Confirmaciones más elegantes
- [ ] Carga de imágenes para sucursales
- [ ] Asignación masiva de empleados

### 🐛 Solución de Problemas

#### Error de CORS

Si ves errores de CORS en la consola:

1. Verifica que en `gestor-turnos-api/config/cors.php` esté configurado:

```php
'allowed_origins' => ['http://localhost:4200'],
```

2. Asegúrate de que el middleware CORS esté activo en la API

#### Error 401 Unauthorized

- Verifica que el token esté siendo enviado correctamente
- Revisa que el token no haya expirado
- Intenta hacer logout y login nuevamente

#### No se cargan los datos

- Verifica que la API esté corriendo en `http://localhost:8000`
- Revisa la consola del navegador para ver errores HTTP
- Verifica que haya datos en la base de datos

### 📞 Soporte

Para más información sobre los endpoints de la API, consulta:

- `gestor-turnos-api/ENDPOINTS.md`
- `gestor-turnos-api/AUTHENTICATION.md`

---

**Última actualización**: 2025-11-29
**Versión**: 2.0.0 (Con integración API)

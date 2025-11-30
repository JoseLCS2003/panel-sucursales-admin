import { Component, OnInit } from '@angular/core';
import { ApiService, User, Negocio } from './services/api.service';

// Definición de la interfaz para los elementos del menú
interface NavItem {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // Estado de Autenticación
  isAuthenticated = false;
  username = '';
  password = '';
  loginError = '';
  currentUser: User | null = null;

  // Estado de 2FA
  requires2FA = false;
  twoFactorCode = '';

  // Estado para controlar si la barra lateral está abierta o cerrada
  isSidebarOpen = true;
  // Estado para rastrear la sección activa
  activeSection: string = 'Panel Sucursales';

  // Detectar si estamos en un dispositivo móvil (usando un breakpoint aproximado)
  isMobile = window.innerWidth < 768;

  // Datos de la API
  sucursales: Negocio[] = [];
  clientes: User[] = [];
  empleados: User[] = [];
  loading = false;
  error = '';

  // Inicialización de los elementos del menú
  navItems: NavItem[] = [
    {
      id: 'Panel Sucursales',
      name: 'Panel Sucursales',
      icon: 'home',
    },
    {
      id: 'Clientes',
      name: 'Clientes',
      icon: 'users',
    },
    {
      id: 'Empleados',
      name: 'Empleados',
      icon: 'briefcase',
    },
    {
      id: 'Estadísticas',
      name: 'Estadísticas',
      icon: 'chart',
    },
    {
      id: 'Configuración',
      name: 'Configuración',
      icon: 'settings',
    },
  ];

  constructor(private apiService: ApiService) {
    // Escucha el evento de redimensionamiento de la ventana para actualizar isMobile
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      // Cierra la barra lateral en móvil si se abre la vista de escritorio
      if (!this.isMobile && !this.isSidebarOpen) {
        this.isSidebarOpen = true;
      }
    });
  }

  ngOnInit(): void {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticated = true;
      this.loadData();
    }
  }

  // Título dinámico para el encabezado
  get activeSectionTitle(): string {
    return (
      this.navItems.find((item) => item.id === this.activeSection)?.name ||
      'Panel Administrativo'
    );
  }

  // Función para alternar la barra lateral
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Función para cambiar la sección activa
  setActiveSection(section: string): void {
    this.activeSection = section;
    // Cierra el sidebar automáticamente en móvil después de hacer clic
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  // Lógica de Autenticación
  login(event: Event): void {
    event.preventDefault();
    this.loginError = '';
    this.loading = true;

    this.apiService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.requires_2fa) {
          this.requires2FA = true;
          this.loading = false;
          // No limpiamos el username porque lo necesitamos para el 2FA
        } else if (response.token) {
          // Login directo (por si acaso cambia la API)
          this.handleLoginSuccess(response);
        }
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.loginError =
          'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        this.password = '';
        this.loading = false;
      },
    });
  }

  // Verificar código 2FA
  verify2FA(): void {
    this.loginError = '';
    this.loading = true;

    this.apiService.verify2FA(this.username, this.twoFactorCode).subscribe({
      next: (response) => {
        this.handleLoginSuccess(response);
      },
      error: (error) => {
        console.error('Error de 2FA:', error);
        this.loginError = 'Código inválido o expirado.';
        this.loading = false;
      },
    });
  }

  // Reenviar código 2FA
  resend2FA(): void {
    this.loading = true;
    this.apiService.resend2FA(this.username).subscribe({
      next: () => {
        alert('Código reenviado a tu correo electrónico.');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al reenviar código:', error);
        alert('Error al reenviar el código.');
        this.loading = false;
      },
    });
  }

  // Manejar login exitoso
  private handleLoginSuccess(response: any): void {
    this.apiService.setToken(response.token);
    this.currentUser = response.user;
    this.isAuthenticated = true;
    this.requires2FA = false;
    this.username = '';
    this.password = '';
    this.twoFactorCode = '';
    this.loading = false;
    this.loadData();
  }

  // Función de cerrar sesión
  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        this.apiService.clearToken();
        this.isAuthenticated = false;
        this.currentUser = null;
        this.activeSection = 'Panel Sucursales';
        this.isSidebarOpen = true;
        this.sucursales = [];
        this.clientes = [];
        this.empleados = [];
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Cerrar sesión localmente de todos modos
        this.apiService.clearToken();
        this.isAuthenticated = false;
        this.currentUser = null;
      },
    });
  }

  // Cargar datos de la API
  loadData(): void {
    this.loadSucursales();
    this.loadUsuarios();
  }

  loadSucursales(): void {
    this.loading = true;
    this.apiService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
        this.error = 'Error al cargar las sucursales';
        this.loading = false;
      },
    });
  }

  loadUsuarios(): void {
    this.loading = true;
    this.apiService.getUsuarios().subscribe({
      next: (data) => {
        // Filtrar por rol (asumiendo: 1=admin, 2=agente/empleado, 3=cliente)
        this.clientes = data.filter((u) => u.role_id === 3);
        this.empleados = data.filter((u) => u.role_id === 2);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar los usuarios';
        this.loading = false;
      },
    });
  }

  // ==================== FUNCIONES DE ESTADÍSTICAS ====================

  getTotalSucursales(): number {
    return this.sucursales.length;
  }

  getSucursalesActivas(): number {
    return this.sucursales.filter((s) => s.estado === 'activa').length;
  }

  getTotalEmpleados(): number {
    return this.empleados.length;
  }

  getTotalClientes(): number {
    return this.clientes.length;
  }

  getCapacidadTotal(): number {
    return this.sucursales.reduce((sum, s) => sum + (s.capacidad || 0), 0);
  }

  // ==================== MODALES Y CRUD ====================

  showModal = false;
  modalType: 'sucursal' | 'cliente' | 'empleado' = 'sucursal';
  isEditing = false;

  // Objetos temporales para formularios
  currentSucursal: Partial<Negocio> = {
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    capacidad: 0,
    estado: 'activa',
  };
  currentUsuario: Partial<User> = {
    name: '',
    email: '',
    password: '',
    role_id: 3,
  };

  // --- SUCURSALES ---

  openCreateSucursalModal() {
    this.modalType = 'sucursal';
    this.isEditing = false;
    this.currentSucursal = {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      capacidad: 0,
      estado: 'activa',
    };
    this.showModal = true;
  }

  openEditSucursalModal(sucursal: Negocio) {
    this.modalType = 'sucursal';
    this.isEditing = true;
    this.currentSucursal = { ...sucursal }; // Copia para no modificar la tabla directamente
    this.showModal = true;
  }

  saveSucursal() {
    this.loading = true;
    if (this.isEditing && this.currentSucursal.id) {
      this.apiService
        .updateSucursal(this.currentSucursal.id, this.currentSucursal)
        .subscribe({
          next: () => {
            this.loadSucursales();
            this.closeModal();
            alert('Sucursal actualizada correctamente');
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            alert('Error al actualizar sucursal');
          },
        });
    } else {
      this.apiService
        .createSucursal(this.currentSucursal as Negocio)
        .subscribe({
          next: () => {
            this.loadSucursales();
            this.closeModal();
            alert('Sucursal creada correctamente');
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            alert('Error al crear sucursal');
          },
        });
    }
  }

  // --- CLIENTES ---

  openCreateClienteModal() {
    this.modalType = 'cliente';
    this.isEditing = false;
    this.currentUsuario = { name: '', email: '', password: '', role_id: 3 };
    this.showModal = true;
  }

  openEditClienteModal(cliente: User) {
    this.modalType = 'cliente';
    this.isEditing = true;
    this.currentUsuario = { ...cliente, password: '' }; // No mostramos el password
    this.showModal = true;
  }

  saveCliente() {
    this.saveUsuario();
  }

  // --- EMPLEADOS ---

  openCreateEmpleadoModal() {
    this.modalType = 'empleado';
    this.isEditing = false;
    this.currentUsuario = {
      name: '',
      email: '',
      password: '',
      role_id: 2,
      sucursal_id: undefined,
    };
    this.showModal = true;
  }

  openEditEmpleadoModal(empleado: User) {
    this.modalType = 'empleado';
    this.isEditing = true;
    this.currentUsuario = { ...empleado, password: '' };
    this.showModal = true;
  }

  saveEmpleado() {
    this.saveUsuario();
  }

  // --- LÓGICA COMÚN USUARIOS ---

  saveUsuario() {
    this.loading = true;

    // Validaciones básicas
    if (!this.currentUsuario.name || !this.currentUsuario.email) {
      alert('Nombre y Email son obligatorios');
      this.loading = false;
      return;
    }

    if (!this.isEditing && !this.currentUsuario.password) {
      alert('La contraseña es obligatoria para nuevos usuarios');
      this.loading = false;
      return;
    }

    if (this.isEditing && this.currentUsuario.id) {
      // Si el password está vacío, lo eliminamos para no enviarlo
      const dataToSend = { ...this.currentUsuario };
      if (!dataToSend.password) delete dataToSend.password;

      this.apiService
        .updateUsuario(this.currentUsuario.id, dataToSend)
        .subscribe({
          next: () => {
            this.loadUsuarios();
            this.closeModal();
            alert('Usuario actualizado correctamente');
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            alert('Error al actualizar usuario');
          },
        });
    } else {
      this.apiService.createUsuario(this.currentUsuario as User).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeModal();
          alert('Usuario creado correctamente');
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert('Error al crear usuario');
        },
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.loading = false;
  }

  // ==================== CRUD SUCURSALES (DELETE) ====================

  deleteSucursal(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
      this.apiService.deleteSucursal(id).subscribe({
        next: () => {
          this.loadSucursales();
          alert('Sucursal eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar sucursal:', error);
          alert('Error al eliminar la sucursal');
        },
      });
    }
  }

  // ==================== CRUD CLIENTES ====================

  deleteCliente(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.apiService.deleteUsuario(id).subscribe({
        next: () => {
          this.loadUsuarios();
          alert('Cliente eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          alert('Error al eliminar el cliente');
        },
      });
    }
  }

  // ==================== CRUD EMPLEADOS ====================

  deleteEmpleado(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      this.apiService.deleteUsuario(id).subscribe({
        next: () => {
          this.loadUsuarios();
          alert('Empleado eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar empleado:', error);
          alert('Error al eliminar el empleado');
        },
      });
    }
  }
}

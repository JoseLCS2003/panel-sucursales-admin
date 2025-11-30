import { Component, OnInit } from '@angular/core';
import { SucursalesService } from '../../../../core/services/sucursales.service';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { Negocio } from '../../../../core/models/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  sucursales: Negocio[] = [];
  loading = false;
  error = '';

  // Stats
  totalEmpleados = 0;
  totalClientes = 0;

  // Modal
  showModal = false;
  isEditing = false;
  currentSucursal: Partial<Negocio> = {
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    capacidad: 0,
    estado: 'activa',
  };

  constructor(
    private sucursalesService: SucursalesService,
    private usuariosService: UsuariosService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadSucursales();
    this.loadStats();
  }

  loadSucursales(): void {
    this.loading = true;
    this.sucursalesService.getSucursales().subscribe({
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

  loadStats(): void {
    // We need to fetch users to count them for stats
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.totalClientes = data.filter((u) => u.role_id === 3).length;
        this.totalEmpleados = data.filter((u) => u.role_id === 2).length;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de usuarios:', error);
      },
    });
  }

  getTotalSucursales(): number {
    return this.sucursales.length;
  }

  getSucursalesActivas(): number {
    return this.sucursales.filter((s) => s.estado === 'activa').length;
  }

  getCapacidadTotal(): number {
    return this.sucursales.reduce((sum, s) => sum + (s.capacidad || 0), 0);
  }

  // Modal Logic
  openCreateSucursalModal() {
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
    this.isEditing = true;
    this.currentSucursal = { ...sucursal };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSucursal() {
    this.loading = true;
    if (this.isEditing && this.currentSucursal.id) {
      this.sucursalesService
        .updateSucursal(this.currentSucursal.id, this.currentSucursal)
        .subscribe({
          next: () => {
            this.loadSucursales();
            this.closeModal();
            this.notificationService.success(
              'Sucursal actualizada correctamente'
            );
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.notificationService.error('Error al actualizar sucursal');
          },
        });
    } else {
      this.sucursalesService
        .createSucursal(this.currentSucursal as Negocio)
        .subscribe({
          next: () => {
            this.loadSucursales();
            this.closeModal();
            this.notificationService.success('Sucursal creada correctamente');
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.notificationService.error('Error al crear sucursal');
          },
        });
    }
  }

  async deleteSucursal(id: number): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      '¿Estás seguro de que deseas eliminar esta sucursal?'
    );
    if (confirmed) {
      this.sucursalesService.deleteSucursal(id).subscribe({
        next: () => {
          this.loadSucursales();
          this.notificationService.success('Sucursal eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar sucursal:', error);
          this.notificationService.error('Error al eliminar la sucursal');
        },
      });
    }
  }
}

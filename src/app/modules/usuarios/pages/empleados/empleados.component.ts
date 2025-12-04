import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { SucursalesService } from '../../../../core/services/sucursales.service';
import { User, Negocio } from '../../../../core/models/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {
  empleados: User[] = [];
  sucursales: Negocio[] = [];
  loading = false;
  error = '';

  // Modal
  showModal = false;
  isEditing = false;
  currentUsuario: Partial<User> = {
    name: '',
    email: '',
    password: '',
    role_id: 4,
    sucursal_id: undefined,
  };

  constructor(
    private usuariosService: UsuariosService,
    private sucursalesService: SucursalesService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadEmpleados();
    this.loadSucursales();
  }

  loadEmpleados(): void {
    this.loading = true;
    this.usuariosService.getUsuariosByRole(4).subscribe({
      next: (data) => {
        this.empleados = data; // Ya viene filtrado del servicio
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
        this.error = 'Error al cargar los empleados';
        this.loading = false;
      },
    });
  }

  loadSucursales(): void {
    this.sucursalesService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
      },
    });
  }

  openCreateEmpleadoModal() {
    this.isEditing = false;
    this.currentUsuario = {
      name: '',
      email: '',
      password: '',
      role_id: 4,
      sucursal_id: undefined,
    };
    this.showModal = true;
  }

  openEditEmpleadoModal(empleado: User) {
    this.isEditing = true;
    this.currentUsuario = { ...empleado, password: '' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveEmpleado() {
    this.loading = true;

    if (!this.currentUsuario.name || !this.currentUsuario.email) {
      this.notificationService.warning('Nombre y Email son obligatorios');
      this.loading = false;
      return;
    }

    if (!this.isEditing && !this.currentUsuario.password) {
      this.notificationService.warning(
        'La contraseña es obligatoria para nuevos usuarios'
      );
      this.loading = false;
      return;
    }

    if (this.isEditing && this.currentUsuario.id) {
      const dataToSend = { ...this.currentUsuario };
      if (!dataToSend.password) delete dataToSend.password;

      this.usuariosService
        .updateUsuario(this.currentUsuario.id, dataToSend)
        .subscribe({
          next: () => {
            this.loadEmpleados();
            this.closeModal();
            this.notificationService.success(
              'Empleado actualizado correctamente'
            );
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.notificationService.error('Error al actualizar empleado');
          },
        });
    } else {
      this.usuariosService
        .createUsuario(this.currentUsuario as User)
        .subscribe({
          next: () => {
            this.loadEmpleados();
            this.closeModal();
            this.notificationService.success('Empleado creado correctamente');
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.notificationService.error('Error al crear empleado');
          },
        });
    }
  }

  async deleteEmpleado(id: number): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      '¿Estás seguro de que deseas eliminar este empleado?'
    );
    if (confirmed) {
      this.usuariosService.deleteUsuario(id).subscribe({
        next: () => {
          this.loadEmpleados();
          this.notificationService.success('Empleado eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar empleado:', error);
          this.notificationService.error('Error al eliminar el empleado');
        },
      });
    }
  }
}

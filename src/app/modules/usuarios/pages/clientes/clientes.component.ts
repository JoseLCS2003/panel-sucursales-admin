import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { User } from '../../../../core/models/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
  clientes: User[] = [];
  loading = false;
  error = '';

  // Modal
  showModal = false;
  isEditing = false;
  currentUsuario: Partial<User> = {
    name: '',
    email: '',
    password: '',
    role_id: 3,
  };

  constructor(
    private usuariosService: UsuariosService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.usuariosService.getUsuariosByRole(3).subscribe({
      next: (data) => {
        this.clientes = data; // Ya viene filtrado del backend
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.error = 'Error al cargar los clientes';
        this.loading = false;
      },
    });
  }

  openCreateClienteModal() {
    this.isEditing = false;
    this.currentUsuario = { name: '', email: '', password: '', role_id: 3 };
    this.showModal = true;
  }

  openEditClienteModal(cliente: User) {
    this.isEditing = true;
    this.currentUsuario = { ...cliente, password: '' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCliente() {
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
            this.loadClientes();
            this.closeModal();
            this.notificationService.success(
              'Cliente actualizado correctamente'
            );
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.notificationService.error('Error al actualizar cliente');
          },
        });
    } else {
      this.usuariosService
        .createUsuario(this.currentUsuario as User)
        .subscribe({
          next: () => {
            this.loadClientes();
            this.closeModal();
            this.notificationService.success('Cliente creado correctamente');
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.notificationService.error('Error al crear cliente');
          },
        });
    }
  }

  async deleteCliente(id: number): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      '¿Estás seguro de que deseas eliminar este cliente?'
    );
    if (confirmed) {
      this.usuariosService.deleteUsuario(id).subscribe({
        next: () => {
          this.loadClientes();
          this.notificationService.success('Cliente eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          this.notificationService.error('Error al eliminar el cliente');
        },
      });
    }
  }
}

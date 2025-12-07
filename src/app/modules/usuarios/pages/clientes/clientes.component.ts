import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { User } from '../../../../core/models/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';
import { ApiService } from '../../../../services/api.service';

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
  clienteForm!: FormGroup;
  currentClienteId?: number;

  // Mostrar/ocultar contraseña
  showPassword = false;

  // Fortaleza de contraseña
  passwordStrength = 0;
  passwordStrengthLevel = { level: 'none', color: 'gray', text: '' };

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.clienteForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          CustomValidators.noWhitespace,
          CustomValidators.fullName,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          CustomValidators.email,
          Validators.maxLength(100),
        ],
      ],
      password: [''],
    });

    // Escuchar cambios en la contraseña para calcular fortaleza
    this.clienteForm.get('password')?.valueChanges.subscribe((password) => {
      this.updatePasswordStrength(password);
    });
  }

  /**
   * Actualiza el indicador de fortaleza de contraseña
   */
  private updatePasswordStrength(password: string): void {
    this.passwordStrength = CustomValidators.getPasswordStrength(password);
    this.passwordStrengthLevel =
      CustomValidators.getPasswordStrengthLevel(password);
  }

  /**
   * Configura las validaciones de contraseña según el modo (crear/editar)
   */
  private setPasswordValidators(isRequired: boolean): void {
    const passwordControl = this.clienteForm.get('password');

    if (isRequired) {
      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
      ]);
    } else {
      passwordControl?.setValidators([
        Validators.minLength(8),
        Validators.maxLength(50),
      ]);
    }

    passwordControl?.updateValueAndValidity();
  }

  loadClientes(): void {
    this.loading = true;
    this.usuariosService.getUsuariosByRole(3).subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.error = 'Error al cargar los clientes';
        this.notificationService.error('Error al cargar los clientes');
        this.loading = false;
      },
    });
  }

  openCreateClienteModal(): void {
    this.isEditing = false;
    this.currentClienteId = undefined;
    this.showPassword = false;
    this.clienteForm.reset();
    this.setPasswordValidators(true); // Contraseña obligatoria al crear
    this.showModal = true;
  }

  openEditClienteModal(cliente: User): void {
    this.isEditing = true;
    this.currentClienteId = cliente.id;
    this.showPassword = false;

    this.clienteForm.patchValue({
      name: cliente.name,
      email: cliente.email,
      password: '',
    });

    this.setPasswordValidators(false); // Contraseña opcional al editar
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.showPassword = false;
    this.clienteForm.reset();
    this.passwordStrength = 0;
    this.passwordStrengthLevel = { level: 'none', color: 'gray', text: '' };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  saveCliente(): void {
    // Marcar todos los campos como tocados para mostrar errores
    this.clienteForm.markAllAsTouched();

    if (this.clienteForm.invalid) {
      this.notificationService.warning(
        'Por favor, corrija los errores en el formulario'
      );
      return;
    }

    this.loading = true;
    const formData = this.clienteForm.value;

    // Preparar datos para enviar
    const usuarioData: any = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role_id: 3,
    };

    // Solo incluir contraseña si se proporcionó
    if (formData.password && formData.password.trim()) {
      usuarioData.password = formData.password;
    }

    if (this.isEditing && this.currentClienteId) {
      this.usuariosService
        .updateUsuario(this.currentClienteId, usuarioData)
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
            this.notificationService.error(
              err.error?.message || 'Error al actualizar cliente'
            );
          },
        });
    } else {
      this.usuariosService.createUsuario(usuarioData as User).subscribe({
        next: () => {
          this.loadClientes();
          this.closeModal();
          this.notificationService.success('Cliente creado correctamente');
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.notificationService.error(
            err.error?.message || 'Error al crear cliente'
          );
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

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(fieldName: string): string {
    const control = this.clienteForm.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (control.errors['invalidEmail']) {
      return 'El formato del email no es válido';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `No puede exceder ${maxLength} caracteres`;
    }

    if (control.errors['whitespace']) {
      return 'No puede contener solo espacios en blanco';
    }

    if (control.errors['fullName']) {
      return 'Debe ingresar nombre y apellido';
    }

    return 'Campo inválido';
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const control = this.clienteForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}

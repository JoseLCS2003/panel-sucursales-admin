import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { SucursalesService } from '../../../../core/services/sucursales.service';
import { User, Negocio } from '../../../../core/models/api.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';

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
  empleadoForm!: FormGroup;
  currentEmpleadoId?: number;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private sucursalesService: SucursalesService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadEmpleados();
    this.loadSucursales();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.empleadoForm = this.fb.group({
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
      sucursal_id: [null, [Validators.required]],
    });
  }

  /**
   * Configura las validaciones de contraseña según el modo (crear/editar)
   */
  private setPasswordValidators(isRequired: boolean): void {
    const passwordControl = this.empleadoForm.get('password');

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

  loadEmpleados(): void {
    this.loading = true;
    this.usuariosService.getUsuariosByRole(4).subscribe({
      next: (data) => {
        this.empleados = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
        this.error = 'Error al cargar los empleados';
        this.notificationService.error('Error al cargar los empleados');
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
        this.notificationService.error('Error al cargar las sucursales');
      },
    });
  }

  openCreateEmpleadoModal(): void {
    this.isEditing = false;
    this.currentEmpleadoId = undefined;
    this.empleadoForm.reset();
    this.setPasswordValidators(true); // Contraseña obligatoria al crear
    this.showModal = true;
  }

  openEditEmpleadoModal(empleado: User): void {
    this.isEditing = true;
    this.currentEmpleadoId = empleado.id;

    this.empleadoForm.patchValue({
      name: empleado.name,
      email: empleado.email,
      password: '',
      sucursal_id: empleado.sucursal_id,
    });

    this.setPasswordValidators(false); // Contraseña opcional al editar
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.empleadoForm.reset();
  }

  saveEmpleado(): void {
    // Marcar todos los campos como tocados para mostrar errores
    this.empleadoForm.markAllAsTouched();

    if (this.empleadoForm.invalid) {
      this.notificationService.warning(
        'Por favor, corrija los errores en el formulario'
      );
      return;
    }

    this.loading = true;
    const formData = this.empleadoForm.value;

    // Preparar datos para enviar
    const usuarioData: any = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role_id: 4,
      sucursal_id: formData.sucursal_id,
    };

    // Solo incluir contraseña si se proporcionó
    if (formData.password && formData.password.trim()) {
      usuarioData.password = formData.password;
    }

    if (this.isEditing && this.currentEmpleadoId) {
      this.usuariosService
        .updateUsuario(this.currentEmpleadoId, usuarioData)
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
            this.notificationService.error(
              err.error?.message || 'Error al actualizar empleado'
            );
          },
        });
    } else {
      this.usuariosService.createUsuario(usuarioData as User).subscribe({
        next: () => {
          this.loadEmpleados();
          this.closeModal();
          this.notificationService.success('Empleado creado correctamente');
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.notificationService.error(
            err.error?.message || 'Error al crear empleado'
          );
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

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(fieldName: string): string {
    const control = this.empleadoForm.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      if (fieldName === 'sucursal_id') {
        return 'Debe seleccionar una sucursal';
      }
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
    const control = this.empleadoForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}

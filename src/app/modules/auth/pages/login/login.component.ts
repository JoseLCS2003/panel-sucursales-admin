import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  twoFactorForm!: FormGroup;
  loginError = '';
  loading = false;
  requires2FA = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/usuarios/clientes']);
    }
  }

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          CustomValidators.email,
          Validators.maxLength(100),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
        ],
      ],
    });

    this.twoFactorForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^[0-9]{6}$/),
        ],
      ],
    });
  }

  login(event: Event): void {
    event.preventDefault();
    this.loginError = '';

    // Marcar todos los campos como tocados para mostrar errores
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.loginError = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.requires_2fa) {
          this.requires2FA = true;
          this.loading = false;
        } else if (response.token) {
          this.handleLoginSuccess(response);
        }
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.loginError =
          'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        this.loginForm.patchValue({ password: '' });
        this.loading = false;
      },
    });
  }

  verify2FA(): void {
    this.loginError = '';

    // Marcar todos los campos como tocados
    this.twoFactorForm.markAllAsTouched();

    if (this.twoFactorForm.invalid) {
      this.loginError = 'El código debe tener 6 dígitos numéricos.';
      return;
    }

    this.loading = true;
    const email = this.loginForm.get('email')?.value;
    const code = this.twoFactorForm.get('code')?.value;

    this.authService.verify2FA(email, code).subscribe({
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

  resend2FA(): void {
    this.loading = true;
    const email = this.loginForm.get('email')?.value;

    this.authService.resend2FA(email).subscribe({
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

  private handleLoginSuccess(response: any): void {
    this.authService.setToken(response.token);

    // Verificar que el usuario sea un agente (role_id = 2)
    this.authService.getMe().subscribe({
      next: (user) => {
        if (user.role_id === 2) {
          // Usuario es agente, permitir acceso
          this.loading = false;
          this.router.navigate(['/usuarios/clientes']);
        } else {
          // Usuario no es agente, denegar acceso
          this.authService.clearToken();
          this.loginError = 'Acceso denegado. Este panel es solo para agentes.';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al obtener información del usuario:', error);
        this.authService.clearToken();
        this.loginError = 'Error al verificar permisos de usuario.';
        this.loading = false;
      },
    });
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);

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

    if (control.errors['pattern']) {
      return 'Debe contener solo números';
    }

    return 'Campo inválido';
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}

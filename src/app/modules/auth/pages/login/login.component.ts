import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  loginError = '';
  loading = false;
  requires2FA = false;
  twoFactorCode = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/usuarios/clientes']);
    }
  }

  login(event: Event): void {
    event.preventDefault();
    this.loginError = '';
    this.loading = true;

    this.authService.login(this.username, this.password).subscribe({
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
        this.password = '';
        this.loading = false;
      },
    });
  }

  verify2FA(): void {
    this.loginError = '';
    this.loading = true;

    this.authService.verify2FA(this.username, this.twoFactorCode).subscribe({
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
    this.authService.resend2FA(this.username).subscribe({
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
}

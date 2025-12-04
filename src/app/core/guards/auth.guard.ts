import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Verificar que el usuario sea un agente (role_id = 2)
    return this.authService.getMe().pipe(
      map((user) => {
        if (user.role_id === 2) {
          return true;
        } else {
          this.authService.clearToken();
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError(() => {
        this.authService.clearToken();
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}

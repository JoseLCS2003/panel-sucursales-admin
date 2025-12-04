import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');

    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('auth_token');
            this.notificationService.error(
              'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
            );
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // No hay token y se requiere autenticación
          this.notificationService.warning(
            'Debes iniciar sesión para acceder a esta página.'
          );
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

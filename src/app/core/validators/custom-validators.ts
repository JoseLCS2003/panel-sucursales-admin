import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

/**
 * Validadores personalizados reutilizables
 */
export class CustomValidators {
  /**
   * Valida que el email tenga un formato válido
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(control.value);

    return valid ? null : { invalidEmail: true };
  }

  /**
   * Validador asíncrono para verificar si el email ya existe
   * @param checkEmailFn Función que verifica el email en el backend
   * @param excludeId ID del usuario a excluir (para edición)
   * @param debounceTime Tiempo de espera antes de validar (ms)
   */
  static emailExists(
    checkEmailFn: (email: string, excludeId?: number) => Observable<boolean>,
    excludeId?: number,
    debounceTime: number = 500
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.trim() === '') {
        return of(null);
      }

      // Validar formato primero
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(control.value)) {
        return of(null); // El validador de formato se encargará
      }

      return timer(debounceTime).pipe(
        switchMap(() => checkEmailFn(control.value, excludeId)),
        map((exists) => (exists ? { emailExists: true } : null)),
        catchError(() => of(null)) // En caso de error, no bloquear
      );
    };
  }

  /**
   * Valida que la contraseña tenga al menos una longitud mínima
   */
  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const valid = control.value.length >= min;
      return valid
        ? null
        : {
            minLength: {
              requiredLength: min,
              actualLength: control.value.length,
            },
          };
    };
  }

  /**
   * Valida que la contraseña sea fuerte (mayúscula, minúscula, número)
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(control.value);
    const hasLowerCase = /[a-z]/.test(control.value);
    const hasNumber = /[0-9]/.test(control.value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;

    if (!valid) {
      return {
        strongPassword: {
          hasUpperCase,
          hasLowerCase,
          hasNumber,
        },
      };
    }

    return null;
  }

  /**
   * Calcula la fortaleza de una contraseña (0-100)
   */
  static getPasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    // Longitud
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;

    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 20;

    // Minúsculas
    if (/[a-z]/.test(password)) strength += 20;

    // Números
    if (/[0-9]/.test(password)) strength += 15;

    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    return Math.min(strength, 100);
  }

  /**
   * Obtiene el nivel de fortaleza de contraseña
   */
  static getPasswordStrengthLevel(password: string): {
    level: string;
    color: string;
    text: string;
  } {
    const strength = CustomValidators.getPasswordStrength(password);

    if (strength === 0) {
      return { level: 'none', color: 'gray', text: '' };
    } else if (strength < 40) {
      return { level: 'weak', color: 'red', text: 'Débil' };
    } else if (strength < 70) {
      return { level: 'medium', color: 'yellow', text: 'Media' };
    } else {
      return { level: 'strong', color: 'green', text: 'Fuerte' };
    }
  }

  /**
   * Valida que no contenga solo espacios en blanco
   */
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  /**
   * Valida que el nombre tenga al menos dos palabras (nombre y apellido)
   */
  static fullName(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const trimmedValue = control.value.trim();
    const words = trimmedValue.split(/\s+/);

    return words.length >= 2 ? null : { fullName: true };
  }

  /**
   * Valida que el teléfono tenga un formato válido (10 dígitos)
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const phoneRegex = /^[0-9]{10}$/;
    const valid = phoneRegex.test(control.value.replace(/\s/g, ''));

    return valid ? null : { invalidPhone: true };
  }

  /**
   * Valida que un número esté dentro de un rango
   */
  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const value = Number(control.value);
      const valid = value >= min && value <= max;

      return valid ? null : { range: { min, max, actual: value } };
    };
  }

  /**
   * Valida que no contenga caracteres especiales peligrosos (prevención XSS básica)
   */
  static noSpecialChars(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const dangerousChars = /[<>{}]/;
    const hasDangerousChars = dangerousChars.test(control.value);

    return hasDangerousChars ? { specialChars: true } : null;
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  id: string;
  name: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  isSidebarOpen = true;
  isMobile = window.innerWidth < 768;
  activeSection = 'Panel Sucursales';

  navItems: NavItem[] = [
    {
      id: 'Panel Sucursales',
      name: 'Panel Sucursales',
      icon: 'home',
      route: '/dashboard',
    },
    {
      id: 'Clientes',
      name: 'Clientes',
      icon: 'users',
      route: '/usuarios/clientes',
    },
    {
      id: 'Empleados',
      name: 'Empleados',
      icon: 'briefcase',
      route: '/usuarios/empleados',
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile && !this.isSidebarOpen) {
        this.isSidebarOpen = true;
      }
    });
  }

  get activeSectionTitle(): string {
    // Logic to get title based on current route could be added here
    return (
      this.navItems.find((item) => this.router.url.includes(item.route))
        ?.name || 'Panel Administrativo'
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearToken();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.authService.clearToken();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}

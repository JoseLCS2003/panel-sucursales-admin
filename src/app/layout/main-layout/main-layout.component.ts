import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/api.models';

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
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  isMobile = window.innerWidth < 768;
  activeSection = 'Clientes';
  currentUser: User | null = null;

  navItems: NavItem[] = [
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

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
      },
    });
  }

  get userInitials(): string {
    if (!this.currentUser || !this.currentUser.name) {
      return 'AD';
    }

    const names = this.currentUser.name.trim().split(' ');

    if (names.length === 1) {
      // Si solo hay un nombre, tomar las primeras 2 letras
      return names[0].substring(0, 2).toUpperCase();
    } else {
      // Si hay más de un nombre, tomar la primera letra de cada uno (máximo 2)
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./modules/usuarios/usuarios.module').then(
            (m) => m.UsuariosModule
          ),
      },
      {
        path: '',
        redirectTo: 'usuarios/clientes',
        pathMatch: 'full',
      },
    ],
  },
  { path: '**', redirectTo: 'usuarios/clientes' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

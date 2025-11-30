import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';

const routes: Routes = [
  { path: 'clientes', component: ClientesComponent },
  { path: 'empleados', component: EmpleadosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosRoutingModule {}

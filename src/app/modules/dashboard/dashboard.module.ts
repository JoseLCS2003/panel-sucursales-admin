import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './pages/home/home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, DashboardRoutingModule, FormsModule],
})
export class DashboardModule {}

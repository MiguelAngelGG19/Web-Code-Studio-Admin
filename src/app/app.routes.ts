import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FisioterapeutaComponent } from './pages/fisioterapeuta/fisioterapeuta.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GestionComponent } from './pages/gestion/gestion.component';
import { SuscripcionesComponent } from './pages/suscripciones/suscripciones.component';
import { EjerciciosComponent } from './pages/ejercicios/ejercicios.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'fisioterapeuta',
    component: FisioterapeutaComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'gestion',
    component: GestionComponent,
  },
  {
    path: 'suscripciones',
    component: SuscripcionesComponent,
  },
  {
    path: 'ejercicios',
    component: EjerciciosComponent,
  },
  {
    path: 'perfil',
    component: PerfilComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

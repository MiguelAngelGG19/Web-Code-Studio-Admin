import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  usuarioActual = {
    nombre: 'Administrador',
    email: '',
    rol: 'Administrador',
    avatar: 'A',
  };

  datosGenerales = {
    fisioterapeutas_suscritos: 0,
    fisioterapeutas_pendientes: 0,
    suscripciones_activas: 0,
    ingresos_mes_actual: 0,
  };

  ultimasActividades: Array<{ tipo: string; mensaje: string; fecha: string }> = [];
  overviewError: string | null = null;

  constructor(
    private auth: AuthService,
    private adminApi: AdminApiService
  ) {}

  ngOnInit() {
    const u = this.auth.getCurrentUser();
    if (u) {
      this.usuarioActual.nombre = u.name || 'Administrador';
      this.usuarioActual.email = u.email;
      this.usuarioActual.avatar = (u.name || u.email || 'A').charAt(0).toUpperCase();
    }

    this.adminApi.getOverview().subscribe({
      next: (data) => {
        this.overviewError = null;
        const p = data.physiotherapists;
        this.datosGenerales.fisioterapeutas_suscritos = p.approved;
        this.datosGenerales.fisioterapeutas_pendientes = p.pending_approval + p.pending_profile;
        this.datosGenerales.suscripciones_activas = data.patients_linked;
        this.datosGenerales.ingresos_mes_actual = Math.round(data.ganancias.total * 100) / 100;

        const acts: typeof this.ultimasActividades = [];
        if (p.pending_approval > 0) {
          acts.push({
            tipo: 'new_application',
            mensaje: `${p.pending_approval} solicitud(es) en espera de aprobación (documentación enviada)`,
            fecha: 'Resumen actual',
          });
        }
        if (p.pending_profile > 0) {
          acts.push({
            tipo: 'info',
            mensaje: `${p.pending_profile} perfil(es) incompleto(s) (aún no aparecen en “Por validar” del API)`,
            fecha: 'Resumen actual',
          });
        }
        acts.push({
          tipo: 'validation_completed',
          mensaje: `Fisioterapeutas aprobados: ${p.approved} · Rechazados: ${p.rejected}`,
          fecha: 'Resumen actual',
        });
        if (data.ganancias.citas_completadas > 0) {
          acts.push({
            tipo: 'new_subscription',
            mensaje: `Ingresos estimados (citas completadas × tarifa): $${this.datosGenerales.ingresos_mes_actual} ${data.ganancias.moneda}`,
            fecha: 'Resumen actual',
          });
        }
        this.ultimasActividades = acts;
      },
      error: () => {
        this.overviewError = 'No se pudo cargar el resumen. ¿Sesión válida y API en marcha?';
        this.ultimasActividades = [
          {
            tipo: 'payment_failed',
            mensaje: this.overviewError,
            fecha: 'Error',
          },
        ];
      },
    });
  }

  getActivityIcon(tipo: string): string {
    const iconMap: { [key: string]: string } = {
      new_subscription: 'check_circle',
      validation_completed: 'verified',
      payment_failed: 'error',
      new_application: 'person_add',
      info: 'info',
    };
    return iconMap[tipo] || 'info';
  }

  getActivityColor(tipo: string): string {
    const colorMap: { [key: string]: string } = {
      new_subscription: 'success',
      validation_completed: 'success',
      payment_failed: 'danger',
      new_application: 'info',
      info: 'info',
    };
    return colorMap[tipo] || 'default';
  }
}

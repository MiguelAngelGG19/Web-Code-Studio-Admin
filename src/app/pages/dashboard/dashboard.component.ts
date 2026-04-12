import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Stats (valores por defecto 0 hasta que cargue el back)
  fisiosSuscritos = 0;
  fisiosValidar = 0;
  suscripcionesNuevas = 0;
  pagosPendientes = 0;
  anuladosPorPagos = 0;
  fisiosRechazados = 0;
  notificacionesNoLeidas = 0;

  // Paneles con datos
  panelesFisiosValidar: any[] = [];
  panelesSuscripciones: any[] = [];
  panelesPagosPendientes: any[] = [];
  panelesFisiosAnulados: any[] = [];
  panelesFisiosRechazados: any[] = [];

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.cargarFisiosPendientes();
    this.cargarStats();
  }

  /** Carga fisios pendientes reales del back */
  cargarFisiosPendientes(): void {
    this.adminApi.getPendingPhysiotherapists().subscribe({
      next: (data) => {
        this.fisiosValidar = data.length;
        this.panelesFisiosValidar = data.slice(0, 5).map((f: any) => ({
          id: f.id_physio ?? f.id,
          nombre: `${f.first_name ?? ''} ${f.last_name_paternal ?? ''}`.trim(),
          especialidad: f.specialty ?? 'Fisioterapia General',
          fecha: f.createdAt ? new Date(f.createdAt).toLocaleDateString('es-MX') : '',
        }));
      },
      error: () => {},
    });
  }

  /** Carga stats generales del back */
  cargarStats(): void {
    this.adminApi.getDashboardStats().subscribe({
      next: (data: any) => {
        this.fisiosSuscritos     = data.fisiosSuscritos     ?? data.totalPhysios        ?? 0;
        this.suscripcionesNuevas = data.suscripcionesNuevas ?? data.newSubscriptions    ?? 0;
        this.pagosPendientes     = data.pagosPendientes     ?? data.pendingPayments     ?? 0;
        this.anuladosPorPagos    = data.anuladosPorPagos    ?? data.cancelledByPayment  ?? 0;
        this.fisiosRechazados    = data.fisiosRechazados    ?? data.rejectedPhysios     ?? 0;
        this.notificacionesNoLeidas = data.notificaciones   ?? data.unreadNotifications ?? 0;
      },
      error: () => {},
    });
  }

  marcarNotificacionLeida(): void {
    if (this.notificacionesNoLeidas > 0) {
      this.notificacionesNoLeidas--;
    }
  }
}

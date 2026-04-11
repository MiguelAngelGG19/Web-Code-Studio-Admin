import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Datos de gráficas
  fisiosSuscritos = 245;
  fisiosValidar = 18;
  suscripcionesNuevas = 12;
  pagosPendientes = 34;
  anuladosPorPagos = 8;
  fisiosRechazados = 5;
  notificacionesNoLeidas = 7;

  // Paneles con datos
  panelesFisiosValidar: any[] = [];
  panelesSuscripciones: any[] = [];
  panelesPagosPendientes: any[] = [];
  panelesFisiosAnulados: any[] = [];
  panelesFisiosRechazados: any[] = [];

  constructor() {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Simular datos de fisios a validar
    this.panelesFisiosValidar = [
      { id: 1, nombre: 'Dr. Juan García', especialidad: 'Fisioterapia General', fecha: '2026-04-08' },
      { id: 2, nombre: 'Dra. María López', especialidad: 'Rehabilitación', fecha: '2026-04-07' },
      { id: 3, nombre: 'Dr. Carlos Ruiz', especialidad: 'Trauma', fecha: '2026-04-06' },
    ];

    // Simular datos de suscripciones nuevas
    this.panelesSuscripciones = [
      { id: 1, nombre: 'Clínica San Juan', plan: 'Premium', fecha: '2026-04-09' },
      { id: 2, nombre: 'Dr. Pedro Martín', plan: 'Estándar', fecha: '2026-04-08' },
    ];

    // Simular datos de pagos pendientes
    this.panelesPagosPendientes = [
      { id: 1, nombre: 'Clínica del Prado', monto: '$450', vencimiento: '2026-04-10' },
      { id: 2, nombre: 'Dr. Antonio Díaz', monto: '$150', vencimiento: '2026-04-12' },
      { id: 3, nombre: 'Fisio Express', monto: '$300', vencimiento: '2026-04-15' },
    ];

    // Simular datos de fisios anulados
    this.panelesFisiosAnulados = [
      { id: 1, nombre: 'Dr. Roberto Fernández', motivo: 'Pagos vencidos', fecha: '2026-04-05' },
      { id: 2, nombre: 'Clínica Salud+', motivo: 'Incumplimiento de términos', fecha: '2026-04-03' },
    ];

    // Simular datos de fisios rechazados
    this.panelesFisiosRechazados = [
      { id: 1, nombre: 'Dr. Luis Gómez', motivo: 'Documentación incompleta', fecha: '2026-04-04' },
      { id: 2, nombre: 'Dra. Sofia Núñez', motivo: 'Credenciales no verificadas', fecha: '2026-04-02' },
    ];
  }

  marcarNotificacionLeida() {
    if (this.notificacionesNoLeidas > 0) {
      this.notificacionesNoLeidas--;
    }
  }
}

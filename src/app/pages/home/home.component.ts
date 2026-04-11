import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  usuarioActual = {
    nombre: 'Administrador',
    email: 'admin@activa.com',
    rol: 'Administrador Admin',
    avatar: 'A'
  };

  datosGenerales = {
    fisioterapeutas_suscritos: 245,
    fisioterapeutas_pendientes: 18,
    suscripciones_activas: 157,
    ingresos_mes_actual: 18450
  };

  ultimasActividades = [
    { tipo: 'new_subscription', mensaje: 'Nueva suscripción de Dr. Juan García', fecha: 'Hace 2 horas' },
    { tipo: 'validation_completed', mensaje: 'Validación completada: Dra. María López', fecha: 'Hace 4 horas' },
    { tipo: 'payment_failed', mensaje: 'Fallo de pago: Clínica San Juan', fecha: 'Hace 1 día' },
    { tipo: 'new_application', mensaje: 'Nueva aplicación de fisioterapeuta', fecha: 'Hace 1 día' }
  ];

  constructor() {}

  ngOnInit() {
    // Aquí irían las llamadas a servicios para obtener datos reales
  }

  getActivityIcon(tipo: string): string {
    const iconMap: { [key: string]: string } = {
      'new_subscription': 'check_circle',
      'validation_completed': 'verified',
      'payment_failed': 'error',
      'new_application': 'person_add'
    };
    return iconMap[tipo] || 'info';
  }

  getActivityColor(tipo: string): string {
    const colorMap: { [key: string]: string } = {
      'new_subscription': 'success',
      'validation_completed': 'success',
      'payment_failed': 'danger',
      'new_application': 'info'
    };
    return colorMap[tipo] || 'default';
  }
}

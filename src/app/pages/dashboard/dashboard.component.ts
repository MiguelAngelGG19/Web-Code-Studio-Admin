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
  // Stats del back
  stats: any = null;
  loadingStats = false;

  // Fisios pendientes
  fisiosValidar: any[] = [];
  fisiosPendientesCount = 0;

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.cargarStats();
    this.cargarFisiosPendientes();
  }

  cargarStats(): void {
    this.loadingStats = true;
    this.adminApi.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadingStats = false;
      },
      error: () => {
        // Si falla stats, mostramos 0s — no bloquea la UI
        this.stats = {};
        this.loadingStats = false;
      },
    });
  }

  cargarFisiosPendientes(): void {
    this.adminApi.getPendingPhysiotherapists().subscribe({
      next: (data) => {
        this.fisiosValidar = data.slice(0, 5); // Solo los primeros 5 en dashboard
        this.fisiosPendientesCount = data.length;
      },
      error: () => {},
    });
  }
}

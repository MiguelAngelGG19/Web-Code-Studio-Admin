import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-fisioterapeuta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fisioterapeuta.component.html',
  styleUrls: ['./fisioterapeuta.component.scss'],
})
export class FisioterapeutaComponent implements OnInit {
  pendientes: any[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargarPendientes(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminApi.getPendingPhysiotherapists().subscribe({
      next: (data) => {
        this.pendientes = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los fisioterapeutas pendientes.';
        this.loading = false;
      },
    });
  }

  aprobar(id: number): void {
    this.successMsg = '';
    this.errorMsg = '';
    this.adminApi.approvePhysiotherapist(id).subscribe({
      next: () => {
        this.successMsg = 'Fisioterapeuta aprobado correctamente.';
        // Remueve de la lista local sin recargar
        this.pendientes = this.pendientes.filter((f) => f.id_physio !== id && f.id !== id);
      },
      error: () => {
        this.errorMsg = 'Error al aprobar. Intenta de nuevo.';
      },
    });
  }
}

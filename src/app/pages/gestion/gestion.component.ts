import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ValidationModalComponent } from '../../components/validation-modal/validation-modal.component';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: 'gestion.component.html',
  styleUrls: ['gestion.component.scss']
})
export class GestionComponent {
  private dialog = inject(MatDialog);
  activeTab = signal<'validar' | 'suscritos' | 'rezagados' | 'rechazados'>('validar');

  // Datos para Por Validar
  porValidar = [
    {
      id: 1,
      nombre: 'Dr. Juan García',
      email: 'juan@example.com',
      titulo: 'Licenciado en Fisioterapia',
      fechaSolicitud: '2024-04-08'
    },
    {
      id: 2,
      nombre: 'Dra. María López',
      email: 'maria@example.com',
      titulo: 'Especialista en Rehabilitación',
      fechaSolicitud: '2024-04-09'
    }
  ];

  // Datos para Suscritos
  suscritos = [
    {
      id: 1,
      nombre: 'Dr. Carlos Ruiz',
      plan: 'Premium',
      vencimiento: '2024-06-15',
      pagos: 5
    },
    {
      id: 2,
      nombre: 'Dra. Paula Martín',
      plan: 'Standard',
      vencimiento: '2024-05-20',
      pagos: 3
    }
  ];

  // Datos para Rezagados
  rezagados = [
    {
      id: 1,
      nombre: 'Dr. Roberto Silva',
      planVencido: '2024-02-15',
      diasRezago: 55
    },
    {
      id: 2,
      nombre: 'Lic. Ana Fernández',
      planVencido: '2024-02-28',
      diasRezago: 42
    }
  ];

  // Datos para Rechazados
  rechazados = [
    {
      id: 1,
      nombre: 'Luis Gómez',
      email: 'luis@example.com',
      motivo: 'Documentos inválidos',
      fechaRechazo: '2024-03-10'
    },
    {
      id: 2,
      nombre: 'Sandra López',
      email: 'sandra@example.com',
      motivo: 'Título no verificable',
      fechaRechazo: '2024-03-12'
    }
  ];

  selectTab(tab: 'validar' | 'suscritos' | 'rezagados' | 'rechazados') {
    this.activeTab.set(tab);
  }

  aprobar(id: number) {
    const index = this.porValidar.findIndex(s => s.id === id);
    if (index !== -1) {
      const aprobado = this.porValidar[index];
      this.suscritos.push({
        id: aprobado.id,
        nombre: aprobado.nombre,
        plan: 'Premium',
        vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pagos: 1
      });
      this.porValidar.splice(index, 1);
      alert(`${aprobado.nombre} ha sido aprobado y agregado a suscritos.`);
    }
  }

  rechazar(id: number, comentario: string = '') {
    const index = this.porValidar.findIndex(s => s.id === id);
    if (index !== -1) {
      const rechazado = this.porValidar[index];
      this.rechazados.push({
        id: rechazado.id,
        nombre: rechazado.nombre,
        email: rechazado.email,
        motivo: comentario || 'Sin especificar',
        fechaRechazo: new Date().toISOString().split('T')[0]
      });
      this.porValidar.splice(index, 1);
      alert(`${rechazado.nombre} ha sido rechazado. Motivo: ${comentario}`);
    }
  }

  verPerfil(id: number) {
    const solicitud = this.porValidar.find(s => s.id === id);
    if (solicitud) {
      const dialogRef = this.dialog.open(ValidationModalComponent, {
        width: '650px',
        maxHeight: '85vh',
        position: { top: '50px' },
        panelClass: 'validation-modal-panel',
        disableClose: false,
        data: solicitud
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result.accion === 'aprobar') {
            this.aprobar(result.id);
          } else if (result.accion === 'rechazar') {
            this.rechazar(result.id, result.comentario);
          }
        }
      });
    }
  }

  enviarNotificacion(id: number) {
    console.log('Notificación enviada:', id);
  }

  verHistorialPagos(id: number) {
    console.log('Ver historial:', id);
  }

  suspenderCuenta(id: number) {
    console.log('Cuenta suspendida:', id);
  }

  reenganchar(id: number) {
    console.log('Re-enganchar:', id);
  }

  eliminarPermanentemente(id: number) {
    console.log('Eliminado:', id);
  }
}


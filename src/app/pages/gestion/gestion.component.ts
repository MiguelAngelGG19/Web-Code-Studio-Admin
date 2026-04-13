import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ValidationModalComponent } from '../../components/validation-modal/validation-modal.component';

const DIAS_OCULTAR_REZAGADO = 60;

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

  suscritos = signal([
    {
      id: 1,
      nombre: 'Dr. Carlos Ruiz',
      email: 'carlos@example.com',
      plan: 'Premium',
      vencimiento: '2024-06-15',
      pagos: 5,
      suspendido: false
    },
    {
      id: 2,
      nombre: 'Dra. Paula Martín',
      email: 'paula@example.com',
      plan: 'Standard',
      vencimiento: '2024-05-20',
      pagos: 3,
      suspendido: false
    }
  ]);

  /** Rezagados: ocultos manualmente o con ≥60 días dejan de listarse (no se borran). */
  rezagados = signal([
    {
      id: 1,
      nombre: 'Dr. Roberto Silva',
      email: 'roberto@example.com',
      planVencido: 'Premium',
      diasRezago: 55,
      oculto: false
    },
    {
      id: 2,
      nombre: 'Lic. Ana Fernández',
      email: 'ana@example.com',
      planVencido: 'Standard',
      diasRezago: 42,
      oculto: false
    },
    {
      id: 3,
      nombre: 'Dr. Viejo Caso',
      email: 'viejo@example.com',
      planVencido: 'Básico',
      diasRezago: 72,
      oculto: false
    }
  ]);

  rezagadosVisibles = computed(() =>
    this.rezagados().filter((r) => !r.oculto && r.diasRezago < DIAS_OCULTAR_REZAGADO)
  );

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
      this.suscritos.update((list) => [
        ...list,
        {
          id: aprobado.id,
          nombre: aprobado.nombre,
          email: aprobado.email,
          plan: 'Premium',
          vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          pagos: 1,
          suspendido: false
        }
      ]);
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
      this.dialog.open(ValidationModalComponent, {
        width: '640px',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'min(90vh, 900px)',
        autoFocus: false,
        panelClass: 'validation-modal-panel',
        backdropClass: 'validation-modal-backdrop',
        disableClose: false,
        hasBackdrop: true,
        data: solicitud
      }).afterClosed().subscribe((result: { accion: string; id: number; comentario?: string } | undefined) => {
        if (result) {
          if (result.accion === 'aprobar') {
            this.aprobar(result.id);
          } else if (result.accion === 'rechazar') {
            this.rechazar(result.id, result.comentario ?? '');
          }
        }
      });
    }
  }

  enviarNotificacion(id: number) {
    const p = this.suscritos().find((x) => x.id === id);
    const dest = p?.email ?? 'el profesional';
    alert(`Se enviará un recordatorio a ${dest} (simulación). En producción se usará el servicio de correo.`);
  }

  verHistorialPagos(id: number) {
    const p = this.suscritos().find((x) => x.id === id);
    if (!p) return;
    alert(
      `Historial de pagos — ${p.nombre}\n\n` +
        `• ${p.pagos} pago(s) registrados\n` +
        `• Plan actual: ${p.plan}\n` +
        `• Próximo vencimiento: ${p.vencimiento}\n\n` +
        '(Vista simulada; conectar con pasarela cuando exista API.)'
    );
  }

  suspenderCuenta(id: number) {
    const p = this.suscritos().find((x) => x.id === id);
    if (!p) return;
    const accion = p.suspendido ? 'reactivar' : 'dar de baja (ocultar en listados)';
    if (!confirm(`¿Deseas ${accion} la cuenta de ${p.nombre}?`)) return;
    this.suscritos.update((list) =>
      list.map((x) => (x.id === id ? { ...x, suspendido: !x.suspendido } : x))
    );
    alert(
      p.suspendido
        ? `${p.nombre}: cuenta reactivada.`
        : `${p.nombre}: cuenta dada de baja (oculta). No se eliminan datos.`
    );
  }

  reenganchar(id: number) {
    const r = this.rezagados().find((x) => x.id === id);
    if (!r) return;
    const cuerpo =
      'Hola,\n\n' +
      'Te escribimos desde Activa. Notamos que tu suscripción está vencida y queremos que sigas con nosotros.\n' +
      'Pronto podrás recibir ofertas o cupones en este mismo canal.\n\n' +
      'Saludos,\nEquipo Activa';
    alert(
      `Correo enviado a ${r.email} (simulación):\n\n---\n${cuerpo}\n---\n\n` +
        '(En producción: integrar SMTP o proveedor de email.)'
    );
  }

  ocultarRezagado(id: number) {
    const r = this.rezagados().find((x) => x.id === id);
    if (!r) return;
    if (!confirm(`¿Ocultar a ${r.nombre} de esta lista? No se elimina del sistema.`)) return;
    this.rezagados.update((list) => list.map((x) => (x.id === id ? { ...x, oculto: true } : x)));
  }
}

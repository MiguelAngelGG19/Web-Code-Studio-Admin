import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ValidationModalComponent } from '../../components/validation-modal/validation-modal.component';
import { AdminApiService, PendingPhysioRow } from '../../services/admin-api.service';

const DIAS_OCULTAR_REZAGADO = 60;

export type PendienteValidarVm = {
  id: number;
  nombre: string;
  email: string;
  titulo: string;
  fechaSolicitud: string;
  licenseDocUrl?: string | null;
  ineDocUrl?: string | null;
};

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: 'gestion.component.html',
  styleUrls: ['gestion.component.scss'],
})
export class GestionComponent implements OnInit {
  private dialog = inject(MatDialog);
  private adminApi = inject(AdminApiService);

  activeTab = signal<'validar' | 'suscritos' | 'rezagados' | 'rechazados'>('validar');

  porValidar = signal<PendienteValidarVm[]>([]);
  pendingLoadError = signal<string | null>(null);
  pendingLoading = signal(false);

  /** El backend no expone listados para estas pestañas; solo UI local. */
  readonly sinApiListados =
    'El API actual no incluye listados de suscritos, rezagados ni rechazados; aquí puedes usar datos locales o esperar nuevos endpoints.';

  suscritos = signal<
    Array<{
      id: number;
      nombre: string;
      email: string;
      plan: string;
      vencimiento: string;
      pagos: number;
      suspendido: boolean;
    }>
  >([]);

  rezagados = signal<
    Array<{
      id: number;
      nombre: string;
      email: string;
      planVencido: string;
      diasRezago: number;
      oculto: boolean;
    }>
  >([]);

  rezagadosVisibles = computed(() =>
    this.rezagados().filter((r) => !r.oculto && r.diasRezago < DIAS_OCULTAR_REZAGADO)
  );

  rechazados = signal<
    Array<{
      id: number;
      nombre: string;
      email: string;
      motivo: string;
      fechaRechazo: string;
    }>
  >([]);

  ngOnInit() {
    this.reloadPending();
  }

  reloadPending() {
    this.pendingLoading.set(true);
    this.pendingLoadError.set(null);
    this.adminApi.getPendingPhysiotherapists().subscribe({
      next: (res) => {
        this.pendingLoading.set(false);
        const rows = res.rows ?? [];
        this.porValidar.set(rows.map((r) => this.mapPendingRow(r)));
      },
      error: (err) => {
        this.pendingLoading.set(false);
        this.pendingLoadError.set(
          err?.error?.message ?? 'No se pudo cargar la lista (¿token admin válido?)'
        );
        this.porValidar.set([]);
      },
    });
  }

  private mapPendingRow(row: PendingPhysioRow): PendienteValidarVm {
    const nombre = [row.first_name, row.last_name_paternal, row.last_name_maternal]
      .filter((x) => x != null && String(x).trim() !== '')
      .join(' ')
      .trim();
    const created = row.created_at ? String(row.created_at).slice(0, 10) : '—';
    return {
      id: row.id_physio,
      nombre: nombre || 'Sin nombre',
      email: row.email ?? '—',
      titulo: row.professional_license ? `Cédula: ${row.professional_license}` : 'Fisioterapeuta',
      fechaSolicitud: created,
      licenseDocUrl: row.license_doc_url,
      ineDocUrl: row.ine_doc_url,
    };
  }

  selectTab(tab: 'validar' | 'suscritos' | 'rezagados' | 'rechazados') {
    this.activeTab.set(tab);
  }

  verPerfil(id: number) {
    const solicitud = this.porValidar().find((s) => s.id === id);
    if (!solicitud) return;
    this.dialog
      .open(ValidationModalComponent, {
        width: '640px',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'min(90vh, 900px)',
        autoFocus: false,
        panelClass: 'validation-modal-panel',
        backdropClass: 'validation-modal-backdrop',
        disableClose: false,
        hasBackdrop: true,
        data: solicitud,
      })
      .afterClosed()
      .subscribe((result: { accion: string; id: number; comentario?: string } | undefined) => {
        if (!result) return;
        if (result.accion === 'aprobar') {
          this.adminApi.approvePhysiotherapist(result.id, 'approved').subscribe({
            next: () => {
              alert('Profesional aprobado.');
              this.reloadPending();
            },
            error: (e) => alert(e?.error?.message ?? 'Error al aprobar'),
          });
        } else if (result.accion === 'rechazar') {
          this.adminApi.approvePhysiotherapist(result.id, 'rejected').subscribe({
            next: () => {
              alert('Solicitud rechazada.');
              this.reloadPending();
            },
            error: (e) => alert(e?.error?.message ?? 'Error al rechazar'),
          });
        }
      });
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

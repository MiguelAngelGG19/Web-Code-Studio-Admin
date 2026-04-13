import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ValidationData {
  id: number;
  nombre: string;
  email: string;
  titulo: string;
  fechaSolicitud: string;
  licenseDocUrl?: string | null;
  ineDocUrl?: string | null;
}

@Component({
  selector: 'app-validation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './validation-modal.component.html',
  styleUrls: ['./validation-modal.component.scss'],
})
export class ValidationModalComponent implements OnInit {
  comentarioText = '';
  showRejectForm = signal(false);
  previewDoc = signal<{ nombre: string; url: string } | null>(null);

  documentos: Array<{ nombre: string; url: string; tipo: string }> = [];

  constructor(
    public dialogRef: MatDialogRef<ValidationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValidationData
  ) {}

  ngOnInit() {
    const docs: Array<{ nombre: string; url: string; tipo: string }> = [];
    const lic = this.data.licenseDocUrl?.trim();
    const ine = this.data.ineDocUrl?.trim();
    if (lic) {
      docs.push({ nombre: 'Documento de cédula / licencia', url: lic, tipo: 'cedula' });
    }
    if (ine) {
      docs.push({ nombre: 'Identificación oficial (INE)', url: ine, tipo: 'ine' });
    }
    this.documentos = docs;
  }

  aprobar() {
    this.dialogRef.close({ accion: 'aprobar', id: this.data.id });
  }

  abrirFormRechazo() {
    this.showRejectForm.set(true);
  }

  cancelarRechazo() {
    this.showRejectForm.set(false);
    this.comentarioText = '';
  }

  confirmarRechazo() {
    if (this.comentarioText.trim() === '') {
      alert('Por favor, ingresa un comentario.');
      return;
    }
    this.dialogRef.close({
      accion: 'rechazar',
      id: this.data.id,
      comentario: this.comentarioText,
    });
  }

  verDocumento(indice: number) {
    const doc = this.documentos[indice];
    if (!doc) return;
    this.previewDoc.set({ nombre: doc.nombre, url: doc.url });
  }

  cerrarPreview() {
    this.previewDoc.set(null);
  }
}

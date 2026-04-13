import { Component, Inject, signal } from '@angular/core';
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
  documentos?: Array<{
    nombre: string;
    url: string;
    tipo: string;
  }>;
}

@Component({
  selector: 'app-validation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './validation-modal.component.html',
  styleUrls: ['./validation-modal.component.scss']
})
export class ValidationModalComponent {
  comentarioText = '';
  showRejectForm = signal(false);
  previewDoc = signal<{ nombre: string; url: string } | null>(null);

  documentos = [
    { nombre: 'Cédula Profesional', url: '#', tipo: 'cedula' },
    { nombre: 'Título Universitario', url: '#', tipo: 'titulo' },
    { nombre: 'Certificado de Especialidad', url: '#', tipo: 'certificado' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ValidationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValidationData
  ) {}

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
      comentario: this.comentarioText
    });
  }

  verDocumento(indice: number) {
    const doc = this.documentos[indice];
    this.previewDoc.set({ nombre: doc.nombre, url: doc.url });
  }

  cerrarPreview() {
    this.previewDoc.set(null);
  }
}

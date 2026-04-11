import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface Plan {
  id: number;
  nombre: string;
  precio: number;
  duracion: number; // en días
  tipoFacturacion: 'Mensual' | 'Anual';
  beneficios: string[];
  activo: boolean;
  fechaCreacion: string;
}

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.scss']
})
export class SuscripcionesComponent {
  planes = signal<Plan[]>([
    {
      id: 1,
      nombre: 'Básico',
      precio: 9.99,
      duracion: 30,
      tipoFacturacion: 'Mensual',
      beneficios: ['Acceso a 50 ejercicios', 'Soporte por email'],
      activo: true,
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      nombre: 'Premium',
      precio: 29.99,
      duracion: 30,
      tipoFacturacion: 'Mensual',
      beneficios: ['Acceso a todos los ejercicios', 'Soporte prioritario', 'Reportes avanzados'],
      activo: true,
      fechaCreacion: '2024-01-15'
    },
    {
      id: 3,
      nombre: 'Anual Premium',
      precio: 299.99,
      duracion: 365,
      tipoFacturacion: 'Anual',
      beneficios: ['Acceso a todos los ejercicios', 'Soporte 24/7', 'Reportes avanzados', 'Descuento 17%'],
      activo: true,
      fechaCreacion: '2024-02-01'
    }
  ]);

  showFormulario = signal(false);
  editandoId = signal<number | null>(null);
  nuevoEditando = signal(false);

  formulario = signal({
    nombre: '',
    precio: 0,
    duracion: 30,
    tipoFacturacion: 'Mensual' as 'Mensual' | 'Anual',
    beneficios: ''
  });

  abrirFormularioNuevo() {
    this.editandoId.set(null);
    this.nuevoEditando.set(true);
    this.formulario.set({
      nombre: '',
      precio: 0,
      duracion: 30,
      tipoFacturacion: 'Mensual',
      beneficios: ''
    });
    this.showFormulario.set(true);
  }

  editarPlan(id: number) {
    const plan = this.planes().find(p => p.id === id);
    if (plan) {
      this.editandoId.set(id);
      this.nuevoEditando.set(false);
      this.formulario.set({
        nombre: plan.nombre,
        precio: plan.precio,
        duracion: plan.duracion,
        tipoFacturacion: plan.tipoFacturacion,
        beneficios: plan.beneficios.join(', ')
      });
      this.showFormulario.set(true);
    }
  }

  guardarPlan() {
    const formularioData = this.formulario();
    if (!formularioData.nombre || formularioData.precio <= 0) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    const beneficios = formularioData.beneficios
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    if (this.nuevoEditando()) {
      // Crear nuevo plan
      const nuevoId = Math.max(...this.planes().map(p => p.id), 0) + 1;
      const nuevoPlan: Plan = {
        id: nuevoId,
        nombre: formularioData.nombre,
        precio: formularioData.precio,
        duracion: formularioData.duracion,
        tipoFacturacion: formularioData.tipoFacturacion,
        beneficios: beneficios,
        activo: true,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      this.planes.set([...this.planes(), nuevoPlan]);
      alert(`Plan "${formularioData.nombre}" creado exitosamente.`);
    } else if (this.editandoId()) {
      // Editar plan existente
      const planesActualizados = this.planes().map(p => {
        if (p.id === this.editandoId()) {
          return {
            ...p,
            nombre: formularioData.nombre,
            precio: formularioData.precio,
            duracion: formularioData.duracion,
            tipoFacturacion: formularioData.tipoFacturacion,
            beneficios: beneficios
          };
        }
        return p;
      });
      this.planes.set(planesActualizados);
      alert(`Plan actualizado exitosamente.`);
    }

    this.cancelarFormulario();
  }

  cancelarFormulario() {
    this.showFormulario.set(false);
    this.editandoId.set(null);
    this.nuevoEditando.set(false);
  }

  toggleActivoPlan(id: number) {
    const planesActualizados = this.planes().map(p => {
      if (p.id === id) {
        return { ...p, activo: !p.activo };
      }
      return p;
    });
    this.planes.set(planesActualizados);
  }

  eliminarPlan(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este plan?')) {
      const planesActualizados = this.planes().filter(p => p.id !== id);
      this.planes.set(planesActualizados);
      alert('Plan eliminado exitosamente.');
    }
  }

  obtenerEstatusTexto(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  obtenerColorEstatus(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-inactive';
  }
}

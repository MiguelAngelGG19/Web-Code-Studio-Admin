import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  zonasCuerpo: string[];
  tipo: 'Estiramiento' | 'Fuerza' | 'Equilibrio' | 'Flexibilidad';
  equipoNecesario: string[];
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  videoUrl: string;
  imagenUrl: string;
  instrucciones: string;
  duracion: number; // en segundos
  activo: boolean;
  fechaCreacion: string;
  etiquetas: string[];
}

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './ejercicios.component.html',
  styleUrls: ['./ejercicios.component.scss']
})
export class EjerciciosComponent {
  ejercicios = signal<Ejercicio[]>([
    {
      id: 1,
      nombre: 'Estiramiento de Espalda Baja',
      descripcion: 'Estiramiento seguro para aliviar tensión en la espalda baja',
      zonasCuerpo: ['Espalda', 'Lumbar'],
      tipo: 'Estiramiento',
      equipoNecesario: ['Tapete'],
      dificultad: 'Básico',
      videoUrl: 'https://example.com/video1.mp4',
      imagenUrl: 'https://example.com/img1.jpg',
      instrucciones: '1. Acuéstate boca arriba\n2. Dobla las rodillas\n3. Lleva las rodillas al pecho',
      duracion: 30,
      activo: true,
      fechaCreacion: '2024-01-10',
      etiquetas: ['principiante', 'relajación']
    },
    {
      id: 2,
      nombre: 'Fortalecimiento de Rodilla',
      descripcion: 'Ejercicio para fortalecer los cuádriceps',
      zonasCuerpo: ['Rodilla', 'Pierna'],
      tipo: 'Fuerza',
      equipoNecesario: ['Banda elástica', 'Silla'],
      dificultad: 'Intermedio',
      videoUrl: 'https://example.com/video2.mp4',
      imagenUrl: 'https://example.com/img2.jpg',
      instrucciones: '1. Siéntate en una silla\n2. Coloca la banda elástica\n3. Extiende la pierna',
      duracion: 45,
      activo: true,
      fechaCreacion: '2024-02-15',
      etiquetas: ['rodilla', 'fortalecimiento']
    },
    {
      id: 3,
      nombre: 'Equilibrio sobre una pierna',
      descripcion: 'Mejora el balance y la coordinación',
      zonasCuerpo: ['Pierna', 'Cadera'],
      tipo: 'Equilibrio',
      equipoNecesario: ['Pared', 'Tapete'],
      dificultad: 'Intermedio',
      videoUrl: 'https://example.com/video3.mp4',
      imagenUrl: 'https://example.com/img3.jpg',
      instrucciones: '1. De pie junto a la pared\n2. Levanta una pierna\n3. Mantén el equilibrio',
      duracion: 60,
      activo: true,
      fechaCreacion: '2024-02-20',
      etiquetas: ['balance', 'coordinación']
    }
  ]);

  // Opciones de filtros
  zonasDisponibles = ['Espalda', 'Rodilla', 'Pierna', 'Cadera', 'Hombro', 'Brazo', 'Cuello', 'Tobillo'];
  tiposDisponibles = ['Estiramiento', 'Fuerza', 'Equilibrio', 'Flexibilidad'];
  equiposDisponibles = ['Tapete', 'Banda elástica', 'Silla', 'Pared', 'Mancuernas', 'Pelota', 'Barra'];
  dificultadesDisponibles = ['Básico', 'Intermedio', 'Avanzado'];

  // Filtros
  busqueda = signal('');
  filtroZonas = signal<string[]>([]);
  filtroTipo = signal('');
  filtroEquipo = signal<string[]>([]);
  filtroDificultad = signal('');
  mostrarSoloActivos = signal(true);

  // Formulario
  showFormulario = signal(false);
  editandoId = signal<number | null>(null);
  nuevoEditando = signal(false);

  formulario = signal({
    nombre: '',
    descripcion: '',
    zonasCuerpo: [] as string[],
    tipo: 'Estiramiento' as Ejercicio['tipo'],
    equipoNecesario: [] as string[],
    dificultad: 'Básico' as Ejercicio['dificultad'],
    videoUrl: '',
    imagenUrl: '',
    instrucciones: '',
    duracion: 30,
    etiquetas: ''
  });

  // Métodos de filtrado
  get ejerciciosFiltrados(): Ejercicio[] {
    let filtrados = this.ejercicios();

    // Filtro de búsqueda
    if (this.busqueda()) {
      const busquedaLower = this.busqueda().toLowerCase();
      filtrados = filtrados.filter(e =>
        e.nombre.toLowerCase().includes(busquedaLower) ||
        e.descripcion.toLowerCase().includes(busquedaLower) ||
        e.etiquetas.some(et => et.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro de zonas
    if (this.filtroZonas().length > 0) {
      filtrados = filtrados.filter(e =>
        e.zonasCuerpo.some(z => this.filtroZonas().includes(z))
      );
    }

    // Filtro de tipo
    if (this.filtroTipo()) {
      filtrados = filtrados.filter(e => e.tipo === this.filtroTipo());
    }

    // Filtro de equipo
    if (this.filtroEquipo().length > 0) {
      filtrados = filtrados.filter(e =>
        this.filtroEquipo().some(eq => e.equipoNecesario.includes(eq))
      );
    }

    // Filtro de dificultad
    if (this.filtroDificultad()) {
      filtrados = filtrados.filter(e => e.dificultad === this.filtroDificultad());
    }

    // Filtro de activos
    if (this.mostrarSoloActivos()) {
      filtrados = filtrados.filter(e => e.activo);
    }

    return filtrados;
  }

  // Métodos de formulario
  abrirFormularioNuevo() {
    this.editandoId.set(null);
    this.nuevoEditando.set(true);
    this.formulario.set({
      nombre: '',
      descripcion: '',
      zonasCuerpo: [],
      tipo: 'Estiramiento',
      equipoNecesario: [],
      dificultad: 'Básico',
      videoUrl: '',
      imagenUrl: '',
      instrucciones: '',
      duracion: 30,
      etiquetas: ''
    });
    this.showFormulario.set(true);
  }

  editarEjercicio(id: number) {
    const ejercicio = this.ejercicios().find(e => e.id === id);
    if (ejercicio) {
      this.editandoId.set(id);
      this.nuevoEditando.set(false);
      this.formulario.set({
        nombre: ejercicio.nombre,
        descripcion: ejercicio.descripcion,
        zonasCuerpo: [...ejercicio.zonasCuerpo],
        tipo: ejercicio.tipo,
        equipoNecesario: [...ejercicio.equipoNecesario],
        dificultad: ejercicio.dificultad,
        videoUrl: ejercicio.videoUrl,
        imagenUrl: ejercicio.imagenUrl,
        instrucciones: ejercicio.instrucciones,
        duracion: ejercicio.duracion,
        etiquetas: ejercicio.etiquetas.join(', ')
      });
      this.showFormulario.set(true);
    }
  }

  guardarEjercicio() {
    const formularioData = this.formulario();
    if (!formularioData.nombre || !formularioData.descripcion) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    const etiquetas = formularioData.etiquetas
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (this.nuevoEditando()) {
      // Crear nuevo ejercicio
      const nuevoId = Math.max(...this.ejercicios().map(e => e.id), 0) + 1;
      const nuevoEjercicio: Ejercicio = {
        id: nuevoId,
        nombre: formularioData.nombre,
        descripcion: formularioData.descripcion,
        zonasCuerpo: formularioData.zonasCuerpo,
        tipo: formularioData.tipo,
        equipoNecesario: formularioData.equipoNecesario,
        dificultad: formularioData.dificultad,
        videoUrl: formularioData.videoUrl,
        imagenUrl: formularioData.imagenUrl,
        instrucciones: formularioData.instrucciones,
        duracion: formularioData.duracion,
        activo: true,
        fechaCreacion: new Date().toISOString().split('T')[0],
        etiquetas: etiquetas
      };
      this.ejercicios.set([...this.ejercicios(), nuevoEjercicio]);
      alert(`Ejercicio "${formularioData.nombre}" creado exitosamente.`);
    } else if (this.editandoId()) {
      // Editar ejercicio existente
      const ejerciciosActualizados = this.ejercicios().map(e => {
        if (e.id === this.editandoId()) {
          return {
            ...e,
            nombre: formularioData.nombre,
            descripcion: formularioData.descripcion,
            zonasCuerpo: formularioData.zonasCuerpo,
            tipo: formularioData.tipo,
            equipoNecesario: formularioData.equipoNecesario,
            dificultad: formularioData.dificultad,
            videoUrl: formularioData.videoUrl,
            imagenUrl: formularioData.imagenUrl,
            instrucciones: formularioData.instrucciones,
            duracion: formularioData.duracion,
            etiquetas: etiquetas
          };
        }
        return e;
      });
      this.ejercicios.set(ejerciciosActualizados);
      alert(`Ejercicio actualizado exitosamente.`);
    }

    this.cancelarFormulario();
  }

  cancelarFormulario() {
    this.showFormulario.set(false);
    this.editandoId.set(null);
    this.nuevoEditando.set(false);
  }

  toggleOcultar(id: number) {
    const ejerciciosActualizados = this.ejercicios().map(e => {
      if (e.id === id) {
        return { ...e, activo: !e.activo };
      }
      return e;
    });
    this.ejercicios.set(ejerciciosActualizados);
    const e = ejerciciosActualizados.find((x) => x.id === id);
    if (e) {
      alert(
        e.activo
          ? 'Ejercicio visible en el catálogo.'
          : 'Ejercicio oculto (dado de baja). Los datos se conservan; no se elimina.'
      );
    }
  }

  toggleZona(zona: string) {
    const filtros = this.filtroZonas();
    if (filtros.includes(zona)) {
      this.filtroZonas.set(filtros.filter(z => z !== zona));
    } else {
      this.filtroZonas.set([...filtros, zona]);
    }
  }

  toggleEquipo(equipo: string) {
    const filtros = this.filtroEquipo();
    if (filtros.includes(equipo)) {
      this.filtroEquipo.set(filtros.filter(e => e !== equipo));
    } else {
      this.filtroEquipo.set([...filtros, equipo]);
    }
  }

  toggleZonaCuerpo(zona: string) {
    const formData = this.formulario();
    if (formData.zonasCuerpo.includes(zona)) {
      this.formulario.set({
        ...formData,
        zonasCuerpo: formData.zonasCuerpo.filter(z => z !== zona)
      });
    } else {
      this.formulario.set({
        ...formData,
        zonasCuerpo: [...formData.zonasCuerpo, zona]
      });
    }
  }

  toggleEquipoNecesario(equipo: string) {
    const formData = this.formulario();
    if (formData.equipoNecesario.includes(equipo)) {
      this.formulario.set({
        ...formData,
        equipoNecesario: formData.equipoNecesario.filter(e => e !== equipo)
      });
    } else {
      this.formulario.set({
        ...formData,
        equipoNecesario: [...formData.equipoNecesario, equipo]
      });
    }
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroZonas.set([]);
    this.filtroTipo.set('');
    this.filtroEquipo.set([]);
    this.filtroDificultad.set('');
  }
}

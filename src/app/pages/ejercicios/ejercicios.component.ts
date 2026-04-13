import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExerciseApiService, ExerciseApiRow } from '../../services/exercise-api.service';
import { environment } from '../../../environments/environment';

/**
 * Multer/Busboy descarta partes de archivo sin nombre en Content-Disposition;
 * algunos navegadores o fotos de cámara dejan `file.name` vacío.
 */
function exerciseUploadFilename(file: File): string {
  const trimmed = file.name?.trim();
  if (trimmed) return trimmed;
  const t = (file.type || '').toLowerCase();
  const n = Date.now();
  if (t.includes('mp4')) return `ejercicio-${n}.mp4`;
  if (t.includes('webm')) return `ejercicio-${n}.webm`;
  if (t.includes('quicktime')) return `ejercicio-${n}.mov`;
  if (t.includes('gif')) return `ejercicio-${n}.gif`;
  if (t.includes('png')) return `ejercicio-${n}.png`;
  if (t.includes('jpeg') || t.includes('jpg')) return `ejercicio-${n}.jpg`;
  if (t.includes('webp')) return `ejercicio-${n}.webp`;
  if (t.includes('bmp')) return `ejercicio-${n}.bmp`;
  if (t.startsWith('video/')) return `ejercicio-${n}.mp4`;
  if (t.startsWith('image/')) return `ejercicio-${n}.jpg`;
  return `ejercicio-${n}.jpg`;
}

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
  duracion: number;
  activo: boolean;
  fechaCreacion: string;
  etiquetas: string[];
  /** Viene del API; el backend no expone PATCH para editar. */
  desdeApi?: boolean;
}

/** Objeto mutable para ngModel (no usar signal con [(ngModel)]). */
type EjercicioFormDraft = {
  nombre: string;
  descripcion: string;
  zonasCuerpo: string[];
  tipo: Ejercicio['tipo'];
  equipoNecesario: string[];
  dificultad: Ejercicio['dificultad'];
  videoUrl: string;
  imagenUrl: string;
  instrucciones: string;
  duracion: number;
  etiquetas: string;
};

function emptyEjercicioForm(): EjercicioFormDraft {
  return {
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
    etiquetas: '',
  };
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
    MatCheckboxModule,
  ],
  templateUrl: './ejercicios.component.html',
  styleUrls: ['./ejercicios.component.scss'],
})
export class EjerciciosComponent implements OnInit {
  private exerciseApi = inject(ExerciseApiService);

  ejercicios = signal<Ejercicio[]>([]);
  catalogoLoading = signal(false);
  catalogoError = signal<string | null>(null);

  zonasDisponibles = ['Espalda', 'Rodilla', 'Pierna', 'Cadera', 'Hombro', 'Brazo', 'Cuello', 'Tobillo'];
  tiposDisponibles = ['Estiramiento', 'Fuerza', 'Equilibrio', 'Flexibilidad'];
  equiposDisponibles = ['Tapete', 'Banda elástica', 'Silla', 'Pared', 'Mancuernas', 'Pelota', 'Barra'];
  dificultadesDisponibles = ['Básico', 'Intermedio', 'Avanzado'];

  busqueda = signal('');
  filtroZonas = signal<string[]>([]);
  filtroTipo = signal('');
  filtroEquipo = signal<string[]>([]);
  filtroDificultad = signal('');
  mostrarSoloActivos = signal(true);

  showFormulario = signal(false);
  editandoId = signal<number | null>(null);
  nuevoEditando = signal(false);

  formDraft: EjercicioFormDraft = emptyEjercicioForm();

  /** Archivo local elegido para nuevo ejercicio (subida multipart). */
  archivoMedia = signal<File | null>(null);
  archivoPreviewUrl = signal<string | null>(null);

  ngOnInit() {
    this.recargarCatalogo();
  }

  recargarCatalogo() {
    this.catalogoLoading.set(true);
    this.catalogoError.set(null);
    this.exerciseApi.listAllExercises().subscribe({
      next: (rows) => {
        this.catalogoLoading.set(false);
        this.ejercicios.set(rows.map((r) => this.mapFromApi(r)));
      },
      error: (err) => {
        this.catalogoLoading.set(false);
        this.catalogoError.set(err?.error?.message ?? 'No se pudo cargar el catálogo (¿sesión admin?)');
        this.ejercicios.set([]);
      },
    });
  }

  /** Origen del API sin `/api` para armar URLs de `/uploads/...`. */
  readonly mediaOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

  absoluteMediaUrl(ref: string): string {
    if (!ref) return '';
    if (/^https?:\/\//i.test(ref)) return ref;
    if (ref.startsWith('/')) return `${this.mediaOrigin}${ref}`;
    return ref;
  }

  isImageMedia(ref: string): boolean {
    return /\.(gif|jpe?g|png|webp|bmp)$/i.test(ref);
  }

  isVideoMedia(ref: string): boolean {
    if (/youtube\.com|youtu\.be/i.test(ref)) return true;
    return /\.(mp4|webm|mov|m4v|ogv)$/i.test(ref);
  }

  isExternalVideoHost(ref: string): boolean {
    return /youtube\.com|youtu\.be/i.test(ref);
  }

  onArchivoMediaChange(ev: Event) {
    const prev = this.archivoPreviewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.archivoPreviewUrl.set(null);
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.archivoMedia.set(file);
    if (file) {
      this.archivoPreviewUrl.set(URL.createObjectURL(file));
    }
  }

  quitarArchivoMedia(input: HTMLInputElement) {
    input.value = '';
    const prev = this.archivoPreviewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.archivoPreviewUrl.set(null);
    this.archivoMedia.set(null);
  }

  private mapFromApi(r: ExerciseApiRow): Ejercicio {
    const rawZone = (r.bodyZone ?? '').trim();
    const zonasCuerpo = rawZone
      ? rawZone
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    return {
      id: r.id,
      nombre: r.name,
      descripcion: r.description ?? '',
      zonasCuerpo,
      tipo: 'Estiramiento',
      equipoNecesario: [],
      dificultad: 'Básico',
      videoUrl: r.videoUrl ?? '',
      imagenUrl: '',
      instrucciones: r.description ?? '',
      duracion: 0,
      activo: true,
      fechaCreacion: '',
      etiquetas: [],
      desdeApi: true,
    };
  }

  get ejerciciosFiltrados(): Ejercicio[] {
    let filtrados = this.ejercicios();

    if (this.busqueda()) {
      const busquedaLower = this.busqueda().toLowerCase();
      filtrados = filtrados.filter(
        (e) =>
          e.nombre.toLowerCase().includes(busquedaLower) ||
          e.descripcion.toLowerCase().includes(busquedaLower) ||
          e.etiquetas.some((et) => et.toLowerCase().includes(busquedaLower))
      );
    }

    if (this.filtroZonas().length > 0) {
      filtrados = filtrados.filter((e) => e.zonasCuerpo.some((z) => this.filtroZonas().includes(z)));
    }

    if (this.filtroTipo()) {
      filtrados = filtrados.filter((e) => e.tipo === this.filtroTipo());
    }

    if (this.filtroEquipo().length > 0) {
      filtrados = filtrados.filter((e) => this.filtroEquipo().some((eq) => e.equipoNecesario.includes(eq)));
    }

    if (this.filtroDificultad()) {
      filtrados = filtrados.filter((e) => e.dificultad === this.filtroDificultad());
    }

    if (this.mostrarSoloActivos()) {
      filtrados = filtrados.filter((e) => e.activo);
    }

    return filtrados;
  }

  abrirFormularioNuevo() {
    this.editandoId.set(null);
    this.nuevoEditando.set(true);
    const prev = this.archivoPreviewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.archivoPreviewUrl.set(null);
    this.archivoMedia.set(null);
    this.formDraft = emptyEjercicioForm();
    this.showFormulario.set(true);
  }

  editarEjercicio(id: number) {
    const ejercicio = this.ejercicios().find((e) => e.id === id);
    if (!ejercicio) return;
    if (ejercicio.desdeApi) {
      alert('El API actual no permite editar ejercicios existentes; solo alta (POST).');
      return;
    }
    this.editandoId.set(id);
    this.nuevoEditando.set(false);
    this.formDraft = {
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
      etiquetas: ejercicio.etiquetas.join(', '),
    };
    this.showFormulario.set(true);
  }

  guardarEjercicio() {
    const formularioData = this.formDraft;
    const nombreTrim = formularioData.nombre?.trim() ?? '';
    if (!nombreTrim) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (nombreTrim.length < 3) {
      alert('El nombre debe tener al menos 3 caracteres (requisito del servidor).');
      return;
    }

    const etiquetas = formularioData.etiquetas
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (this.nuevoEditando()) {
      const bodyZone =
        formularioData.zonasCuerpo.length > 0 ? formularioData.zonasCuerpo.join(', ') : 'General';
      const description = [formularioData.descripcion, formularioData.instrucciones]
        .filter((x) => x && x.trim())
        .join('\n\n')
        .trim();
      if (description.length < 10) {
        alert('La descripción (o instrucciones) debe sumar al menos 10 caracteres; así lo exige el API.');
        return;
      }

      const file = this.archivoMedia();
      if (!file) {
        alert('Debes elegir un archivo de multimedia (video, GIF o imagen) para dar de alta el ejercicio en el servidor.');
        return;
      }

      const fd = new FormData();
      fd.append('name', nombreTrim);
      fd.append('bodyZone', bodyZone);
      fd.append('description', description);
      fd.append('media', file, exerciseUploadFilename(file));
      this.exerciseApi.createExerciseWithMedia(fd).subscribe({
        next: () => {
          alert(`Ejercicio "${formularioData.nombre}" registrado con archivo multimedia.`);
          this.cancelarFormulario();
          this.recargarCatalogo();
        },
        error: (err) => {
          const debug = {
            status: (err as { status?: number })?.status,
            server: (err as { error?: unknown })?.error,
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              uploadName: exerciseUploadFilename(file),
            },
            payload: { name: nombreTrim, bodyZone, descriptionLen: description.length },
          };
          console.error('POST /api/exercises failed', debug);
          try {
            console.error('POST /api/exercises failed JSON', JSON.stringify(debug, null, 2));
          } catch {
            // ignorable
          }
          alert(this.formatExerciseApiError(err));
        },
      });
      return;
    }

    if (this.editandoId()) {
      const ejerciciosActualizados = this.ejercicios().map((e) => {
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
            etiquetas,
          };
        }
        return e;
      });
      this.ejercicios.set(ejerciciosActualizados);
      alert('Ejercicio actualizado (solo en vista local).');
    }

    this.cancelarFormulario();
  }

  cancelarFormulario() {
    const prev = this.archivoPreviewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.archivoPreviewUrl.set(null);
    this.archivoMedia.set(null);
    this.showFormulario.set(false);
    this.editandoId.set(null);
    this.nuevoEditando.set(false);
  }

  toggleOcultar(id: number) {
    const ejerciciosActualizados = this.ejercicios().map((e) => {
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
          ? 'Ejercicio visible en el catálogo (solo en esta sesión; el API no guarda “oculto”).'
          : 'Ejercicio oculto en esta vista. No se elimina en el servidor.'
      );
    }
  }

  toggleZona(zona: string) {
    const filtros = this.filtroZonas();
    if (filtros.includes(zona)) {
      this.filtroZonas.set(filtros.filter((z) => z !== zona));
    } else {
      this.filtroZonas.set([...filtros, zona]);
    }
  }

  toggleEquipo(equipo: string) {
    const filtros = this.filtroEquipo();
    if (filtros.includes(equipo)) {
      this.filtroEquipo.set(filtros.filter((e) => e !== equipo));
    } else {
      this.filtroEquipo.set([...filtros, equipo]);
    }
  }

  toggleZonaCuerpo(zona: string) {
    const z = this.formDraft.zonasCuerpo;
    if (z.includes(zona)) {
      this.formDraft.zonasCuerpo = z.filter((x) => x !== zona);
    } else {
      this.formDraft.zonasCuerpo = [...z, zona];
    }
  }

  toggleEquipoNecesario(equipo: string) {
    const eq = this.formDraft.equipoNecesario;
    if (eq.includes(equipo)) {
      this.formDraft.equipoNecesario = eq.filter((e) => e !== equipo);
    } else {
      this.formDraft.equipoNecesario = [...eq, equipo];
    }
  }

  private formatExerciseApiError(err: unknown): string {
    const e = err as {
      error?: {
        message?: string;
        errors?: Array<{ message?: string } | string | Record<string, unknown>>;
        details?: Record<string, unknown>;
      };
    };
    const issues = e?.error?.errors;
    if (Array.isArray(issues) && issues.length > 0) {
      const parts = issues.map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'message' in item) {
          const m = (item as { message: unknown }).message;
          return typeof m === 'string' ? m : JSON.stringify(item);
        }
        return null;
      }).filter((x): x is string => x != null && x.length > 0);
      if (parts.length > 0) {
        return parts.join(' ');
      }
    }
    if (e?.error?.message && typeof e.error.message === 'string') {
      if (e.error.details && typeof e.error.details === 'object') {
        try {
          return `${e.error.message} | detalles: ${JSON.stringify(e.error.details)}`;
        } catch {
          return e.error.message;
        }
      }
      return e.error.message;
    }
    return 'Error al crear ejercicio';
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroZonas.set([]);
    this.filtroTipo.set('');
    this.filtroEquipo.set([]);
    this.filtroDificultad.set('');
  }
}

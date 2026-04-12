import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Fisioterapeutas ──────────────────────────────────────────

  /** Lista fisioterapeutas con status pending_approval */
  getPendingPhysiotherapists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/physiotherapists/pending`);
  }

  /** Aprueba un fisioterapeuta por id */
  approvePhysiotherapist(id: number): Observable<any> {
    return this.http.patch(`${this.api}/physiotherapists/${id}/approve`, {});
  }

  // ── Dashboard ────────────────────────────────────────────────

  /** Stats generales del dashboard */
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.api}/dashboard/stats`);
  }

  // ── Ejercicios ───────────────────────────────────────────────

  /** Lista todos los ejercicios */
  getExercises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/exercises`);
  }

  /** Crea un ejercicio nuevo */
  createExercise(data: { name: string; description: string; category: string }): Observable<any> {
    return this.http.post(`${this.api}/exercises`, data);
  }
}

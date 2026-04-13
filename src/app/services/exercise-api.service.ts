import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, EMPTY, expand, reduce } from 'rxjs';
import { environment } from '../../environments/environment';

export type ExerciseApiRow = {
  id: number;
  name: string;
  bodyZone: string;
  description: string;
  videoUrl: string | null;
};

@Injectable({ providedIn: 'root' })
export class ExerciseApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listAllExercises(limit = 100): Observable<ExerciseApiRow[]> {
    return this.http
      .get<{
        success: boolean;
        page: number;
        limit: number;
        total: number;
        rows: ExerciseApiRow[];
      }>(`${this.base}/exercises`, {
        params: new HttpParams().set('limit', String(limit)).set('page', '1'),
      })
      .pipe(
        expand((res) => {
          const fetched = (res.page - 1) * res.limit + res.rows.length;
          if (fetched >= res.total || res.rows.length === 0) {
            return EMPTY;
          }
          const nextPage = res.page + 1;
          return this.http.get<{
            success: boolean;
            page: number;
            limit: number;
            total: number;
            rows: ExerciseApiRow[];
          }>(`${this.base}/exercises`, {
            params: new HttpParams().set('limit', String(res.limit)).set('page', String(nextPage)),
          });
        }),
        reduce((acc, res) => acc.concat(res.rows), [] as ExerciseApiRow[])
      );
  }

  /** multipart/form-data: campos name, bodyZone, description y archivo en "media" */
  createExerciseWithMedia(formData: FormData): Observable<unknown> {
    return this.http.post(`${this.base}/exercises`, formData);
  }
}

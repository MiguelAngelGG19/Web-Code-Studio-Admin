import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminOverviewDto = {
  success: boolean;
  physiotherapists: {
    pending_profile: number;
    pending_approval: number;
    approved: number;
    rejected: number;
    total: number;
  };
  users: {
    patient_accounts: number;
    physio_accounts: number;
    admin_accounts: number;
  };
  patients_linked: number;
  appointments: {
    total: number;
    by_status: Record<string, number>;
  };
  ganancias: {
    moneda: 'MXN';
    total: number;
    citas_completadas: number;
    tarifa_por_cita: number;
  };
  generated_at: string;
};

export type PendingPhysioRow = {
  id_physio: number;
  first_name: string;
  last_name_paternal?: string | null;
  last_name_maternal?: string | null;
  email?: string;
  professional_license?: string | null;
  license_doc_url?: string | null;
  ine_doc_url?: string | null;
  status?: string;
  created_at?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getOverview(): Observable<AdminOverviewDto> {
    return this.http.get<AdminOverviewDto>(`${this.base}/admin/overview`);
  }

  getPendingPhysiotherapists(): Observable<{ success: boolean; rows: PendingPhysioRow[] }> {
    return this.http.get<{ success: boolean; rows: PendingPhysioRow[] }>(
      `${this.base}/physiotherapists/pending`
    );
  }

  approvePhysiotherapist(idPhysio: number, action: 'approved' | 'rejected'): Observable<unknown> {
    return this.http.patch(`${this.base}/physiotherapists/${idPhysio}/approve`, { action });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminSessionUser = {
  id: number;
  email: string;
  name: string;
  role: 'admin';
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<AdminSessionUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('adminToken');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser) as AdminSessionUser;
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(parsed);
      } catch {
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminToken');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ token: string; admin: { id: number; email: string; name: string } }>(
        `${environment.apiUrl}/auth/login-admin`,
        { email, password }
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('adminToken', res.token);
          const user: AdminSessionUser = {
            id: res.admin.id,
            email: res.admin.email,
            name: res.admin.name,
            role: 'admin',
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(user);
        }),
        map(() => true),
        catchError((err) => {
          const msg = err?.error?.message ?? err?.message ?? 'Error al iniciar sesión';
          console.error(msg);
          return throwError(() => err);
        })
      );
  }

  logout(): void {
    this.clearSession();
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): AdminSessionUser | null {
    return this.currentUserSubject.value;
  }
}

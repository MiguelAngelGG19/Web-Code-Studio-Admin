import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');
    if (savedUser && token) {
      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ token: string; user?: any }>(
        `${environment.apiUrl}/auth/login`,
        { email, password }
      )
      .pipe(
        map((res) => {
          // El back devuelve { token, ... } — guardamos el token
          localStorage.setItem('admin_token', res.token);
          // Construimos el objeto de usuario para la sesión local
          const user = res.user ?? { email, role: 'admin' };
          localStorage.setItem('admin_user', JSON.stringify(user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(user);
          return true;
        }),
        catchError((err) => {
          return throwError(
            () =>
              new Error(
                err?.error?.message ??
                  'Credenciales incorrectas. Verifica tu email y contraseña.'
              )
          );
        })
      );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}

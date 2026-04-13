import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Añade Bearer para rutas del API salvo el login admin (público).
 */
export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login-admin')) {
    return next(req);
  }
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};

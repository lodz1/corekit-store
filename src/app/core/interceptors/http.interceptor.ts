import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Solo añade el baseUrl si la URL no es absoluta
  let apiReq = req;
  if (!req.url.startsWith('http') && !req.url.startsWith(environment.apiBaseUrl)) {
    apiReq = req.clone({
      url: `${environment.apiBaseUrl}/${req.url}`
    });
  }

  // Agregar token de autenticación si está disponible
  const token = authService.getToken();
  if (token && authService.isTokenValid()) {
    apiReq = apiReq.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return next(apiReq);
};

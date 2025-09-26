import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo añade el baseUrl si la URL no es absoluta
  if (!req.url.startsWith('http') && !req.url.startsWith(environment.apiBaseUrl)) {
    const apiReq = req.clone({
      url: `${environment.apiBaseUrl}/${req.url}`
    });
    return next(apiReq);
  }

  return next(req);
};

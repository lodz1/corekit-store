import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CategoriesResponse {
  categories: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/categories`;

  /**
   * Obtiene todas las categorías activas
   */
  getCategories(): Observable<Category[]> {
    console.log('🌐 CategoriesService: Solicitando categorías desde:', this.apiUrl);
    return this.http.get<CategoriesResponse>(this.apiUrl).pipe(
      map(response => {
        console.log('🌐 CategoriesService: Respuesta recibida:', response);
        // Extraer el array de categorías del objeto de respuesta
        return response.categories || [];
      })
    );
  }
}

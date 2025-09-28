import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  shortDescription?: string;
  longDescription?: string;
  unit?: string;
  stock?: number;
  images?: string[];
  attributes?: { [key: string]: any };
}

export interface ProductsResponse {
  items: Product[];
  totalCount: number;
}

export interface ProductsParams {
  page: number;
  pageSize: number;
  categoryId?: string; // Se mantiene como string para compatibilidad con query params
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/products`;

  /**
   * Obtiene productos del catálogo con paginación y filtros
   */
  getProducts(params: ProductsParams): Observable<ProductsResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }

    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    return this.http.get<ProductsResponse>(`${this.apiUrl}/catalog`, { params: httpParams });
  }

  /**
   * Obtiene un producto individual por ID
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}

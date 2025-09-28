import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CartItemRequest,
  CartValidationResult,
  CreateOrderRequest,
  OrderSummary
} from '../models/checkout.models';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  /**
   * Valida el carrito en el servidor
   */
  validateCart(items: CartItemRequest[]): Observable<CartValidationResult> {
    return this.http.post<CartValidationResult>(`${this.apiUrl}/cart/validate`, { items });
  }

  /**
   * Crea una nueva orden
   */
  createOrder(payload: CreateOrderRequest, idempotencyKey: string): Observable<OrderSummary> {
    const headers = new HttpHeaders({
      'Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json'
    });

    return this.http.post<OrderSummary>(`${this.apiUrl}/orders`, payload, { headers });
  }

  /**
   * Obtiene una orden por ID
   */
  getOrder(orderId: string): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.apiUrl}/orders/${orderId}`);
  }

  /**
   * Genera una nueva clave de idempotencia
   */
  generateIdempotencyKey(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Obtiene o genera una clave de idempotencia desde sessionStorage
   */
  getIdempotencyKey(): string {
    if (typeof window !== 'undefined') {
      const existingKey = sessionStorage.getItem('checkout_idempotency_key');
      if (existingKey) {
        return existingKey;
      }

      const newKey = this.generateIdempotencyKey();
      sessionStorage.setItem('checkout_idempotency_key', newKey);
      return newKey;
    }

    return this.generateIdempotencyKey();
  }

  /**
   * Limpia la clave de idempotencia del sessionStorage
   */
  clearIdempotencyKey(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('checkout_idempotency_key');
    }
  }
}

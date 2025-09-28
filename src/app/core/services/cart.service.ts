import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './products.service';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly CART_KEY = 'corekit_cart';

  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCartFromStorage());
  public cart$ = this.cartSubject.asObservable();

  /**
   * Obtiene el carrito actual
   */
  getCart(): CartItem[] {
    const cart = this.cartSubject.value;
    return Array.isArray(cart) ? cart : [];
  }

  /**
   * Obtiene el snapshot actual del carrito (alias de getCart para compatibilidad)
   */
  getSnapshot(): CartItem[] {
    return this.getCart();
  }

  /**
   * Agrega un producto al carrito
   */
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.getCart();

    // Validación adicional para asegurar que currentCart es un array
    if (!Array.isArray(currentCart)) {
      console.error('Cart is not an array, resetting...', currentCart);
      this.updateCart([]);
      return;
    }

    const existingItem = currentCart.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const cartItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || '',
        quantity: quantity
      };
      currentCart.push(cartItem);
    }

    this.updateCart(currentCart);
    this.showSnackbar(`¡${product.name} agregado al carrito!`);
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  updateQuantity(productId: string, quantity: number): void {
    const currentCart = this.getCart();
    const item = currentCart.find(item => item.productId === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateCart(currentCart);
      }
    }
  }

  /**
   * Elimina un producto del carrito
   */
  removeFromCart(productId: string): void {
    const currentCart = this.getCart();
    const updatedCart = currentCart.filter(item => item.productId !== productId);
    this.updateCart(updatedCart);
  }

  /**
   * Limpia todo el carrito
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Obtiene el total de ítems en el carrito
   */
  getCartTotal(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Obtiene el precio total del carrito
   */
  getCartPriceTotal(): number {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Actualiza el carrito y lo persiste en localStorage
   */
  private updateCart(cart: CartItem[]): void {
    // Actualizar el BehaviorSubject
    this.cartSubject.next(cart);

    // Persistir en localStorage
    this.saveCartToStorage(cart);
  }

  /**
   * Carga el carrito desde localStorage
   */
  private loadCartFromStorage(): CartItem[] {
    if (typeof window !== 'undefined') {
      try {
        const cartData = localStorage.getItem(this.CART_KEY);
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          return Array.isArray(parsedCart) ? parsedCart : [];
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Limpiar datos corruptos
        localStorage.removeItem(this.CART_KEY);
      }
    }

    return [];
  }

  /**
   * Guarda el carrito en localStorage
   */
  private saveCartToStorage(cart: CartItem[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }

  /**
   * Muestra un snackbar de confirmación
   */
  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}

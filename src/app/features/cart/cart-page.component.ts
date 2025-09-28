import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService, CartItem } from '../../core/services';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  cartItems: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  loading = false;

  private cartSubscription?: Subscription;

  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'subtotal', 'actions'];

  ngOnInit() {
    this.loading = true;
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItems = cart;
      this.totalItems = this.cartService.getCartTotal();
      this.totalPrice = this.cartService.getCartPriceTotal();
      this.loading = false;
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  onQuantityChange(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  onRemoveItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  onClearCart() {
    this.cartService.clearCart();
  }

  onCheckout() {
    this.router.navigate(['/checkout']);
  }

  getSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getQuantityOptions(max: number): number[] {
    return Array.from({ length: Math.min(max, 10) }, (_, i) => i + 1);
  }
}

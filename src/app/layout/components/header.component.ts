import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';

import { CartService } from '../../core/services';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  cartItemsCount = 0;
  isAuthenticated = signal(false);
  currentUser = signal<any>(null);
  private cartSubscription?: Subscription;
  private authSubscription?: Subscription;

  ngOnInit() {
    // Suscribirse a los cambios del carrito
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItemsCount = this.cartService.getCartTotal();
    });

    // Suscribirse a los cambios de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated.set(isAuth);
    });

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

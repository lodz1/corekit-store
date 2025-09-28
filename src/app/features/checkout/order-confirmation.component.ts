import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from '../../core/services/checkout.service';
import { OrderSummary } from '../../core/models/checkout.models';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly checkoutService = inject(CheckoutService);

  // Signals
  isLoading = signal(true);
  order = signal<OrderSummary | null>(null);

  ngOnInit(): void {
    this.loadOrder();
  }

  private async loadOrder(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (!orderId) {
      this.isLoading.set(false);
      return;
    }

    try {
      const order = await this.checkoutService.getOrder(orderId).toPromise();
      this.order.set(order || null);
    } catch (error) {
      console.error('Error loading order:', error);
      this.snackBar.open('Error al cargar el pedido', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusIcon(): string {
    const status = this.order()?.status;
    switch (status) {
      case 'Pending': return 'schedule';
      case 'Confirmed': return 'check_circle';
      case 'Cancelled': return 'cancel';
      default: return 'help';
    }
  }

  getStatusIconClass(): string {
    const status = this.order()?.status;
    return `status-${status?.toLowerCase()}`;
  }

  getStatusText(): string {
    const status = this.order()?.status;
    switch (status) {
      case 'Pending': return 'Pendiente';
      case 'Confirmed': return 'Confirmado';
      case 'Cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  getStatusTextClass(): string {
    const status = this.order()?.status;
    return `status-${status?.toLowerCase()}`;
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}

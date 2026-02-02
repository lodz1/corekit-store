import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutService } from '../../core/services/checkout.service';
import { OrderSummary, PaymentIntentDto, PaymentResultDto } from '../../core/models/checkout.models';
import { PaymentDialogComponent, PaymentDialogData } from './payment-dialog.component';

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
  private readonly dialog = inject(MatDialog);

  // Signals
  isLoading = signal(true);
  isProcessingPayment = signal(false);
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
      case 'PendingPayment': return 'payment';
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
      case 'PendingPayment': return 'Pendiente de Pago';
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

  async retryPayment(): Promise<void> {
    const order = this.order();
    if (!order || order.status !== 'PendingPayment') {
      return;
    }

    this.isProcessingPayment.set(true);

    try {
      // Crear intent de pago
      const paymentIntent = await this.checkoutService.createPaymentIntent(order.orderId).toPromise();

      if (!paymentIntent) {
        throw new Error('Error al crear el intent de pago');
      }

      // Abrir diálogo de pago
      const dialogData: PaymentDialogData = {
        paymentIntent,
        orderNumber: order.orderNumber,
        amount: order.totals.grandTotal
      };

      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        data: dialogData,
        disableClose: true,
        width: '500px',
        maxWidth: '90vw'
      });

      const result = await dialogRef.afterClosed().toPromise();

      if (result?.success) {
        // Pago exitoso, recargar la orden
        this.snackBar.open(`Pago aprobado. Pedido #${order.orderNumber} confirmado.`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        // Recargar la orden para actualizar el estado
        await this.loadOrder();
      } else {
        // Usuario canceló o hubo error
        this.snackBar.open('Pago cancelado. La orden permanece pendiente de pago.', 'Entendido', { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      this.snackBar.open('Error al procesar el pago. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
    } finally {
      this.isProcessingPayment.set(false);
    }
  }

  isPendingPayment(): boolean {
    return this.order()?.status === 'PendingPayment';
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService, CartItem } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { AuthService } from '../../core/services/auth.service';
import {
  CartValidationResult,
  CreateOrderRequest,
  CartItemRequest,
  PaymentIntentDto,
  PaymentResultDto
} from '../../core/models/checkout.models';
import { PaymentDialogComponent, PaymentDialogData } from './payment-dialog.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Signals
  isLoading = signal(false);
  isSubmitting = signal(false);
  cartValidation = signal<CartValidationResult | null>(null);

  // Form
  customerForm: FormGroup;

  constructor() {
    this.customerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      street: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Verificar autenticación antes de continuar
    if (!this.authService.isTokenValid()) {
      this.snackBar.open('Debes iniciar sesión para continuar con el checkout', 'Iniciar Sesión', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.validateCart();
  }

  private async validateCart(): Promise<void> {
    const cartItems = this.cartService.getSnapshot();

    if (cartItems.length === 0) {
      this.goToProducts();
      return;
    }

    this.isLoading.set(true);

    try {
      const cartItemRequests: CartItemRequest[] = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const validation = await this.checkoutService.validateCart(cartItemRequests).toPromise();
      this.cartValidation.set(validation!);

      // Si hay warnings, mostrar diálogo de confirmación
      if (validation?.warnings && validation.warnings.length > 0) {
        this.showWarningsDialog(validation);
      }
    } catch (error) {
      console.error('Error validating cart:', error);
      this.snackBar.open('Error al validar el carrito', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  private showWarningsDialog(validation: CartValidationResult): void {
    // Por ahora solo mostramos el snackbar, en una implementación completa
    // se podría mostrar un diálogo de confirmación
    const warningsText = validation.warnings!.join(', ');
    this.snackBar.open(`Atención: ${warningsText}`, 'Entendido', { duration: 5000 });
  }

  async onSubmit(): Promise<void> {
    if (this.customerForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Revalidar carrito antes de crear la orden
      const cartItems = this.cartService.getSnapshot();
      const cartItemRequests: CartItemRequest[] = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const validation = await this.checkoutService.validateCart(cartItemRequests).toPromise();

      if (!validation) {
        throw new Error('Error al validar el carrito');
      }

      // Crear la orden
      const orderData: CreateOrderRequest = {
        customer: {
          fullName: this.customerForm.value.fullName,
          email: this.customerForm.value.email,
          phone: this.customerForm.value.phone
        },
        shippingAddress: {
          street: this.customerForm.value.street,
          number: this.customerForm.value.number,
          city: this.customerForm.value.city,
          province: this.customerForm.value.province,
          postalCode: this.customerForm.value.postalCode
        },
        items: cartItemRequests,
        notes: this.customerForm.value.notes,
        paymentMethod: 'test'
      };

      const idempotencyKey = this.checkoutService.getIdempotencyKey();
      const order = await this.checkoutService.createOrder(orderData, idempotencyKey).toPromise();

      if (order) {
        // Si la orden está en estado PendingPayment, crear intent de pago
        if (order.status === 'PendingPayment') {
          await this.processPayment(order);
        } else {
          // Orden confirmada directamente (caso legacy)
          this.handleOrderSuccess(order);
        }
      }
    } catch (error: any) {
      console.error('Error creating order:', error);

      if (error.status === 409) {
        // Conflicto de precios/stock
        this.snackBar.open('Los precios o stock han cambiado. Por favor, revisa tu carrito.', 'Actualizar', { duration: 5000 });
        this.validateCart(); // Revalidar carrito
      } else {
        this.snackBar.open('Error al crear el pedido. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async processPayment(order: any): Promise<void> {
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
        // Pago exitoso
        this.handlePaymentSuccess(result.result);
      } else {
        // Usuario canceló o hubo error
        this.snackBar.open('Pago cancelado. La orden permanece pendiente de pago.', 'Entendido', { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      this.snackBar.open('Error al procesar el pago. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
    }
  }

  private handlePaymentSuccess(paymentResult: PaymentResultDto): void {
    // Limpiar carrito
    this.cartService.clearCart();

    // Limpiar clave de idempotencia
    this.checkoutService.clearIdempotencyKey();

    // Navegar a confirmación
    this.router.navigate(['/order-confirmation', paymentResult.order.orderId]);
  }

  private handleOrderSuccess(order: any): void {
    // Limpiar carrito
    this.cartService.clearCart();

    // Limpiar clave de idempotencia
    this.checkoutService.clearIdempotencyKey();

    // Mostrar mensaje de éxito
    this.snackBar.open(`Pedido confirmado (#${order.orderNumber})`, 'Cerrar', { duration: 5000 });

    // Navegar a confirmación
    this.router.navigate(['/order-confirmation', order.orderId]);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}

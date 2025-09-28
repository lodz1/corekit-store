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
import {
  CartValidationResult,
  CreateOrderRequest,
  CartItemRequest
} from '../../core/models/checkout.models';

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
        // Limpiar carrito
        this.cartService.clearCart();

        // Limpiar clave de idempotencia
        this.checkoutService.clearIdempotencyKey();

        // Mostrar mensaje de éxito
        this.snackBar.open(`Pedido confirmado (#${order.orderNumber})`, 'Cerrar', { duration: 5000 });

        // Navegar a confirmación
        this.router.navigate(['/order-confirmation', order.orderId]);
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

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}

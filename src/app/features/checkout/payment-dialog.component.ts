import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from '../../core/services/checkout.service';
import { PaymentIntentDto, ConfirmPaymentRequest } from '../../core/models/checkout.models';

export interface PaymentDialogData {
  paymentIntent: PaymentIntentDto;
  orderNumber: string;
  amount: number;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly checkoutService = inject(CheckoutService);
  private readonly fb = inject(FormBuilder);

  // Signals
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);

  // Form
  paymentForm: FormGroup;

  // Datos del diálogo
  paymentIntent: PaymentIntentDto;
  orderNumber: string;
  amount: number;

  // Meses y años para el select
  months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  years: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PaymentDialogData) {
    this.paymentIntent = data.paymentIntent;
    this.orderNumber = data.orderNumber;
    this.amount = data.amount;

    // Generar años (año actual + 10 años)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push((currentYear + i).toString());
    }

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
      expMonth: ['', Validators.required],
      expYear: ['', Validators.required],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      holderName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');

    // Formatear con espacios cada 4 dígitos
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    this.paymentForm.patchValue({ cardNumber: formattedValue });
  }

  onCvcInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/gi, '');

    // Limitar a 4 dígitos máximo
    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    this.paymentForm.patchValue({ cvc: value });
  }

  async onSubmit(): Promise<void> {
    if (this.paymentForm.invalid || this.isProcessing()) {
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    try {
      const formValue = this.paymentForm.value;

      const payload: ConfirmPaymentRequest = {
        paymentIntentId: this.paymentIntent.id,
        paymentMethod: {
          type: 'card',
          cardNumber: formValue.cardNumber.replace(/\s/g, ''),
          expMonth: formValue.expMonth,
          expYear: formValue.expYear,
          cvc: formValue.cvc,
          holderName: formValue.holderName
        }
      };

      const result = await this.checkoutService.confirmPayment(payload).toPromise();

      if (result) {
        this.snackBar.open(`Pago aprobado. Pedido #${this.orderNumber} confirmado.`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        this.dialogRef.close({ success: true, result });
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);

      let errorMsg = 'Error al procesar el pago. Intenta nuevamente.';

      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      this.errorMessage.set(errorMsg);
    } finally {
      this.isProcessing.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getCardNumberError(): string {
    const control = this.paymentForm.get('cardNumber');
    if (control?.hasError('required')) {
      return 'El número de tarjeta es requerido';
    }
    if (control?.hasError('pattern')) {
      return 'Ingresa un número de tarjeta válido (16 dígitos)';
    }
    return '';
  }

  getCvcError(): string {
    const control = this.paymentForm.get('cvc');
    if (control?.hasError('required')) {
      return 'El CVC es requerido';
    }
    if (control?.hasError('pattern')) {
      return 'Ingresa un CVC válido (3-4 dígitos)';
    }
    return '';
  }

  getHolderNameError(): string {
    const control = this.paymentForm.get('holderName');
    if (control?.hasError('required')) {
      return 'El nombre del titular es requerido';
    }
    if (control?.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return '';
  }
}


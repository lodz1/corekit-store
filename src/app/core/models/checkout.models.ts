// Modelos para el checkout y órdenes

export interface CartItemRequest {
  productId: string;
  quantity: number;
}

export interface CartValidationItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  availableStock: number;
  quantity: number;
  subtotal: number;
}

export interface CartValidationTotals {
  itemsTotal: number;
  shipping: number;
  taxes: number;
  grandTotal: number;
}

export interface CartValidationResult {
  items: CartValidationItem[];
  totals: CartValidationTotals;
  warnings?: string[];
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone?: string;
}

export interface ShippingAddress {
  street: string;
  number: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface CreateOrderRequest {
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: CartItemRequest[];
  notes?: string;
  paymentMethod: 'test';
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTotals {
  itemsTotal: number;
  shipping: number;
  taxes: number;
  grandTotal: number;
}

export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  status: 'Pending' | 'PendingPayment' | 'Confirmed' | 'Cancelled';
  items: OrderItem[];
  totals: OrderTotals;
  createdAt: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  notes?: string;
  paymentMethod: string;
}

// Modelos para pagos
export interface CreatePaymentIntentRequest {
  orderId: string;
}

export interface PaymentIntentDto {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: 'fake';
  status: 'RequiresConfirmation' | 'Succeeded' | 'Failed' | 'Canceled';
  clientToken: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethod: {
    type: 'card';
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    holderName?: string;
  };
}

export interface PaymentResultDto {
  paymentIntent: PaymentIntentDto;
  order: OrderSummary;
}

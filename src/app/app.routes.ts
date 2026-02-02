import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home-page.component').then(c => c.HomePageComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list.component').then(c => c.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail.component').then(c => c.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart-page.component').then(c => c.CartPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page.component').then(c => c.LoginPageComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout-page.component').then(c => c.CheckoutPageComponent)
  },
  {
    path: 'order-confirmation/:orderId',
    loadComponent: () => import('./features/checkout/order-confirmation.component').then(c => c.OrderConfirmationComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

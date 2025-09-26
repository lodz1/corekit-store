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
    path: 'cart',
    loadComponent: () => import('./features/cart/cart-page.component').then(c => c.CartPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

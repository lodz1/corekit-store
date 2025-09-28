import { Component, OnInit, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of } from 'rxjs';

import { ProductsService, Product, CartService } from '../../core/services';

const PRODUCT_DETAIL_KEY = makeStateKey<Product>('product_detail');

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
    MatGridListModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  product: Product | null = null;
  loading = false;
  error: string | null = null;
  selectedQuantity = 1;
  selectedImageIndex = 0;

  // Flag para evitar problemas durante SSR
  isClient = false;

  ngOnInit() {
    this.isClient = isPlatformBrowser(this.platformId);
    this.loadProduct();
  }

  private loadProduct() {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.error = 'ID de producto no válido';
      return;
    }

    this.loading = true;
    this.error = null;

    // Intentar obtener producto del TransferState primero
    const productFromState = this.transferState.get(PRODUCT_DETAIL_KEY, null);

    if (productFromState && productFromState.id === productId) {
      console.log('✅ Producto encontrado en TransferState:', productFromState);
      this.product = productFromState;
      this.loading = false;
      return;
    }

    console.log('🌐 Obteniendo producto del servidor...');
    this.productsService.getProduct(productId).pipe(
      catchError(error => {
        console.error('❌ Error loading product:', error);
        this.error = 'Error al cargar el producto. Por favor, intenta de nuevo.';
        this.loading = false;
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        console.log('📦 Producto recibido del servicio:', product);
        this.product = product;
        this.loading = false;
        this.error = null;

        // Guardar en TransferState para SSR
        if (isPlatformBrowser(this.platformId)) {
          this.transferState.set(PRODUCT_DETAIL_KEY, product);
        }
      } else {
        this.error = 'Producto no encontrado';
        this.loading = false;
      }
    });
  }

  onAddToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.selectedQuantity);
    }
  }

  onImageSelect(index: number) {
    this.selectedImageIndex = index;
  }

  onQuantityChange(quantity: number) {
    this.selectedQuantity = Math.max(1, Math.min(quantity, this.product?.stock || 1));
  }

  getProductImages(): string[] {
    if (!this.product) return [];

    if (this.product.images && this.product.images.length > 0) {
      return this.product.images;
    }

    if (this.product.imageUrl) {
      return [this.product.imageUrl];
    }

    return [];
  }

  getAttributeEntries(): Array<{key: string, value: any}> {
    if (!this.product?.attributes) return [];

    return Object.entries(this.product.attributes).map(([key, value]) => ({
      key: this.formatAttributeKey(key),
      value: value
    }));
  }

  getQuantityOptions(): number[] {
    const maxStock = this.product?.stock || 10;
    const maxOptions = Math.min(maxStock, 10);
    return Array.from({ length: maxOptions }, (_, i) => i + 1);
  }

  private formatAttributeKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}

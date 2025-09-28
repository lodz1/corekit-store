import { Component, OnInit, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductsService, Product, ProductsResponse, CategoriesService, Category } from '../../core/services';

const PRODUCTS_KEY = makeStateKey<ProductsResponse>('products');
const CATEGORIES_KEY = makeStateKey<Category[]>('categories');

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductCardComponent,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  products: Product[] = [];
  categories: Category[] = [];
  totalCount = 0;
  loading = false;
  error: string | null = null;

  // Controles de formulario
  searchControl = new FormControl('');
  categoryControl = new FormControl('');

  // Parámetros de paginación
  currentPage = 1;
  pageSize = 12;
  pageSizeOptions = [6, 12, 24, 48];

  // Flag para evitar problemas durante SSR
  isClient = false;

  ngOnInit() {
    this.isClient = isPlatformBrowser(this.platformId);
    this.loadCategories();
    this.setupQueryParamsSubscription();
    this.setupSearchSubscription();
  }

  private loadCategories() {
    console.log('🔄 Cargando categorías...');

    // Intentar obtener categorías del TransferState primero
    const categoriesFromState = this.transferState.get(CATEGORIES_KEY, null);

    if (categoriesFromState) {
      console.log('✅ Categorías encontradas en TransferState:', categoriesFromState);
      this.categories = Array.isArray(categoriesFromState) ? categoriesFromState : [];
    } else {
      console.log('🌐 Obteniendo categorías del servidor...');
      this.categoriesService.getCategories().pipe(
        catchError(error => {
          console.error('❌ Error loading categories:', error);
          return of([]);
        })
      ).subscribe(categories => {
        console.log('📦 Categorías recibidas del servicio:', categories);
        this.categories = Array.isArray(categories) ? categories : [];
        console.log('📦 Categorías asignadas al componente:', this.categories.length);

        // Guardar en TransferState para SSR
        if (isPlatformBrowser(this.platformId)) {
          this.transferState.set(CATEGORIES_KEY, this.categories);
        }
      });
    }
  }

  private setupQueryParamsSubscription() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = parseInt(params['page']) || 1;
      this.pageSize = parseInt(params['pageSize']) || 12;

      const search = params['search'] || '';
      const categoryId = params['categoryId'] || '';

      // Actualizar controles sin emitir eventos
      this.searchControl.setValue(search, { emitEvent: false });
      this.categoryControl.setValue(categoryId, { emitEvent: false });

      this.loadProducts();
    });
  }

  private setupSearchSubscription() {
    // Combinar cambios de búsqueda y categoría
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value),
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.categoryControl.valueChanges.pipe(
        startWith(this.categoryControl.value),
        distinctUntilChanged()
      )
    ]).subscribe(([search, categoryId]) => {
      this.updateQueryParams({
        search: search || undefined,
        categoryId: categoryId || undefined,
        page: 1 // Reset a primera página al cambiar filtros
      });
    });
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchControl.value || undefined,
      categoryId: this.categoryControl.value || undefined
    };

    // Intentar obtener productos del TransferState primero (solo en la primera carga)
    const productsFromState = this.transferState.get(PRODUCTS_KEY, null);

    if (productsFromState && this.currentPage === 1 && !params.search && !params.categoryId) {
      this.products = Array.isArray(productsFromState.items) ? productsFromState.items : [];
      this.totalCount = productsFromState.totalCount || 0;
      this.loading = false;
      return;
    }

    this.productsService.getProducts(params).pipe(
      catchError(error => {
        console.error('Error loading products:', error);
        this.error = 'Error al cargar los productos. Por favor, intenta de nuevo.';
        this.loading = false;
        return of({ items: [], totalCount: 0 });
      })
    ).subscribe(response => {
      this.products = Array.isArray(response.items) ? response.items : [];
      this.totalCount = response.totalCount || 0;
      this.loading = false;
      this.error = null;

      // Guardar en TransferState para SSR (solo primera carga sin filtros)
      if (isPlatformBrowser(this.platformId) && this.currentPage === 1 && !params.search && !params.categoryId) {
        this.transferState.set(PRODUCTS_KEY, response);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.updateQueryParams({
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    });
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  private updateQueryParams(params: any) {
    const queryParams = { ...this.route.snapshot.queryParams };

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        queryParams[key] = params[key];
      } else {
        delete queryParams[key];
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }
}

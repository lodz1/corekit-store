import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Product, CartService } from '../../core/services';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  private readonly cartService = inject(CartService);

  @Input() product: Product = {
    id: '1',
    name: 'Producto Ejemplo',
    price: 29.99,
    imageUrl: 'https://picsum.photos/300/200?random=8',
    categoryName: 'Categoría Ejemplo'
  };

  onAddToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product);
  }
}

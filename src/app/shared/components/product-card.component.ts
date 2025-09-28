import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../core/services/products.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product: Product = {
    id: '1',
    name: 'Producto Ejemplo',
    price: 29.99,
    imageUrl: 'https://picsum.photos/300/200?random=8',
    categoryName: 'Categoría Ejemplo'
  };

  onAddToCart() {
    console.log('Agregado al carrito:', this.product);
    // TODO: Implementar lógica del carrito
  }
}

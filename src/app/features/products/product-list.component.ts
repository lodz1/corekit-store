import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent, Product } from '../../shared/components/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.products = [
      {
        id: 1,
        name: 'Smartphone Premium',
        price: 799.99,
        image: 'https://picsum.photos/300/200?random=4',
        description: 'El último modelo con tecnología de punta y cámara profesional.'
      },
      {
        id: 2,
        name: 'Laptop Gaming',
        price: 1299.99,
        image: 'https://picsum.photos/300/200?random=5',
        description: 'Laptop de alto rendimiento para gaming y trabajo profesional.'
      },
      {
        id: 3,
        name: 'Auriculares Inalámbricos',
        price: 199.99,
        image: 'https://picsum.photos/300/200?random=6',
        description: 'Sonido cristalino con cancelación de ruido activa.'
      },
      {
        id: 4,
        name: 'Smartwatch',
        price: 299.99,
        image: 'https://picsum.photos/300/200?random=7',
        description: 'Monitorea tu salud y mantente conectado en todo momento.'
      }
    ];
  }
}

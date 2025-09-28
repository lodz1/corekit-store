import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { Product } from '../../core/services';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone Premium',
      price: 49.99,
      imageUrl: 'https://picsum.photos/300/200?random=1',
      categoryName: 'Electrónicos'
    },
    {
      id: '2',
      name: 'Laptop Gaming',
      price: 79.99,
      imageUrl: 'https://picsum.photos/300/200?random=2',
      categoryName: 'Computadoras'
    },
    {
      id: '3',
      name: 'Auriculares Inalámbricos',
      price: 29.99,
      imageUrl: 'https://picsum.photos/300/200?random=3',
      categoryName: 'Audio'
    }
  ];
}

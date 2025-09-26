import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductCardComponent, Product } from '../../shared/components/product-card.component';

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
      id: 1,
      name: 'Smartphone Premium',
      price: 49.99,
      image: 'https://picsum.photos/300/200?random=1',
      description: 'Este es un producto destacado con características increíbles.'
    },
    {
      id: 2,
      name: 'Laptop Gaming',
      price: 79.99,
      image: 'https://picsum.photos/300/200?random=2',
      description: 'Otro producto amazónico que no puedes perderte.'
    },
    {
      id: 3,
      name: 'Auriculares Inalámbricos',
      price: 29.99,
      image: 'https://picsum.photos/300/200?random=3',
      description: 'El mejor precio para la mejor calidad del mercado.'
    }
  ];
}

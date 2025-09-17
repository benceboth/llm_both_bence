import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/product.interface';
import { Observable, map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [AsyncPipe, DecimalPipe, NgIf, NgFor],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  cartItems$!: Observable<CartItem[]>;
  total$!: Observable<number>;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cartItems$;
    this.total$ = this.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0))
    );
  }

  removeFromCart(id: number): void {
    this.cartService.removeFromCart(id);
  }

  updateQuantity(id: number, event: Event): void {
    const quantity = parseInt((event.target as HTMLInputElement).value, 10);
    this.cartService.updateCartItem(id, quantity);
  }
}

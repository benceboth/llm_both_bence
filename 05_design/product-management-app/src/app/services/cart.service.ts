import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, AddToCartDTO } from '../models/product.interface';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private productService: ProductService) {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.productService.getCartItems().subscribe(items => {
      this.cartItemsSubject.next(items);
    });
  }

  addToCart(item: AddToCartDTO): void {
    this.productService.addToCart(item).subscribe(() => {
      this.loadCartItems();
    });
  }

  removeFromCart(id: number): void {
    this.productService.removeFromCart(id).subscribe(() => {
      this.loadCartItems();
    });
  }

  updateCartItem(id: number, quantity: number): void {
    this.productService.updateCartItem(id, quantity).subscribe(() => {
      this.loadCartItems();
    });
  }
}

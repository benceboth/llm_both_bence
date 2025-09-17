import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ProductCardComponent } from './product-card.component';
import { NewProductDialogComponent } from './new-product-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog.component';
import { ProductDetailDialogComponent } from './product-detail-dialog.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { Product, CreateProductDTO, UpdateProductDTO } from '../models/product.interface';

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [AsyncPipe, ProductCardComponent, NgFor],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private _productService: ProductService,
    private _cartService: CartService,
    private _dialog: Dialog,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this._productService.getProducts().subscribe(products => {
      this.products = products;
      this._cdr.markForCheck();
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    // TODO: Implement search functionality
  }

  onAddProduct(): void {
    const dialogRef = this._dialog.open<CreateProductDTO>(NewProductDialogComponent);
    dialogRef.closed.subscribe(result => {
      if (result) {
        this._productService.createProduct(result).subscribe(() => {
          this.loadProducts();
        });
      }
    });
  }

  onViewProduct(product: Product): void {
    this._dialog.open(ProductDetailDialogComponent, {
      data: product
    });
  }

  onEditProduct(product: Product): void {
    const dialogRef = this._dialog.open<UpdateProductDTO>(EditProductDialogComponent, {
      data: product
    });
    
    dialogRef.closed.subscribe(result => {
      if (result) {
        this._productService.updateProduct(result.id, result).subscribe(() => {
          this.loadProducts();
        });
      }
    });
  }

  onDeleteProduct(product: Product): void {
    const dialogRef = this._dialog.open<boolean>(DeleteConfirmationDialogComponent, {
      data: product
    });
    
    dialogRef.closed.subscribe(confirmed => {
      if (confirmed) {
        this._productService.deleteProduct(product.id).subscribe(() => {
          this.loadProducts();
        });
      }
    });
  }

  onAddToCart(product: Product): void {
    if (product.stock > 0) {
      this._cartService.addToCart({ product_id: product.id, quantity: 1 });
      product.stock -= 1;
      this._cdr.markForCheck();
    }
  }
}

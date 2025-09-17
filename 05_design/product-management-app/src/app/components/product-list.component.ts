import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { ProductService } from '../services/product.service';
import { ProductCardComponent } from './product-card.component';
import { NewProductDialogComponent } from './new-product-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog.component';
import { ProductDetailDialogComponent } from './product-detail-dialog.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { Product, CreateProductDTO, UpdateProductDTO } from '../models/product.interface';

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [AsyncPipe, ProductCardComponent],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private refresh$ = new BehaviorSubject<void>(undefined);
  products$ = this.refresh$.pipe(
    switchMap(() => this._productService.getProducts())
  );

  constructor(
    private _productService: ProductService,
    private _dialog: Dialog
  ) {}

  ngOnInit(): void {
    // Initial load is handled by refresh$ BehaviorSubject
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
          this.refresh$.next();
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
          this.refresh$.next();
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
          this.refresh$.next();
        });
      }
    });
  }
}
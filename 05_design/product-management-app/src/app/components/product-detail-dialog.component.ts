import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Product } from '../models/product.interface';

@Component({
  standalone: true,
  selector: 'app-product-detail-dialog',
  templateUrl: './product-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailDialogComponent {
  readonly product = inject<Product>(DIALOG_DATA);

  constructor(private dialogRef: DialogRef) {}

  close(): void {
    this.dialogRef.close();
  }
}
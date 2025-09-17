import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Product, UpdateProductDTO } from '../models/product.interface';

@Component({
  standalone: true,
  selector: 'app-edit-product-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-product-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditProductDialogComponent {
  private readonly data = inject<Product>(DIALOG_DATA);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef<UpdateProductDTO>
  ) {
    this.form = this.fb.group({
      name: [this.data.name, [Validators.required]],
      description: [this.data.description],
      price: [this.data.price, [Validators.required, Validators.min(0)]],
      stock: [this.data.stock, [Validators.required, Validators.min(0)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        id: this.data.id
      });
    }
  }
}
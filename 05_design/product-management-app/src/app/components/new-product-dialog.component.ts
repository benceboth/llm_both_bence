import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { CreateProductDTO } from '../models/product.interface';

@Component({
  standalone: true,
  selector: 'app-new-product-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './new-product-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewProductDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef<CreateProductDTO>
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

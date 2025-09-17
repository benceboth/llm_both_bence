import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: '**', redirectTo: '' }
];

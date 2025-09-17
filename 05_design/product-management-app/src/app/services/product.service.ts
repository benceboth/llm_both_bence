import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, CreateProductDTO, UpdateProductDTO } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: CreateProductDTO): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: UpdateProductDTO): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/products/${id}`);
  }
}
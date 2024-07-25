import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from './Category';
import { Product } from './Product';
import { UserPricing } from './UserPricing';
import { PriceGroup } from './PriceGroup';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}categories/`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}products/`);
  }

  getUserPricing(): Observable<UserPricing[]> {
    return this.http.get<UserPricing[]>(`${this.apiUrl}user_pricing/`);
  }

  getPriceGroups(): Observable<PriceGroup[]> {
    return this.http.get<PriceGroup[]>(`${this.apiUrl}price_groups/`);
  }
}

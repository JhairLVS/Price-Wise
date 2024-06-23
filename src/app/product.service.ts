import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  searchProducts(query: string): Observable<any> {
    return this.http.post('/search', { query });
  }

  comparePrices(query: string): Observable<any> {
    return this.http.post('/compare-prices', { query });
  }
}

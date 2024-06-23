import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  query: string = '';
  results: any[] = [];
  selectedProduct: any = null;
  comparisons: any[] = [];

  constructor(private http: HttpClient) {}

  async searchProducts(event: Event) {
    event.preventDefault();
    try {
      const response: any = await this.http.post('/search', { query: this.query, site: 'all' }).toPromise();
      this.results = response;
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  }

  async showDetails(product: any) {
    this.selectedProduct = product;
    try {
      const response: any = await this.http.post('/compare-prices', { query: this.query }).toPromise();
      this.comparisons = response;
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    }
  }
}

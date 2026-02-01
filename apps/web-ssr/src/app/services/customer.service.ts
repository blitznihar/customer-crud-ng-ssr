import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export type CreateCustomer = Omit<Customer, '_id'>;

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private base = `${environment.apiBaseUrl}/customers`;
  constructor(private http: HttpClient) {}

  // private resolveBase(): string {
  //   const apiUrl = (environment.apiUrl || '').replace(/\/+$/, '');
  //   console.log('Resolved API base URL:', apiUrl ? `${apiUrl}/customers` : '/internal-api/customers');
  //   return apiUrl ? `${apiUrl}/customers` : '/internal-api/customers';
  // }

  list(): Observable<Customer[]> {
    console.log('Fetching customers from:', this.base);
    return this.http.get<Customer[]>(this.base);
  }

  create(c: CreateCustomer): Observable<Customer> {
    console.log('Creating customer at:', this.base, 'with data:', c);
    return this.http.post<Customer>(this.base, c);
  }

  update(id: string, c: Partial<CreateCustomer>): Observable<Customer> {
    console.log('Updating customer at:', `${this.base}/${id}`, 'with data:', c);
    return this.http.put<Customer>(`${this.base}/${id}`, c);
  }

  delete(id: string): Observable<void> {
    console.log('Deleting customer at:', `${this.base}/${id}`);
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

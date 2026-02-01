import { Component, inject } from '@angular/core';
import { CustomerService, Customer, CreateCustomer } from '../services/customer.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createcustomers',
  imports: [CommonModule, FormsModule],
  templateUrl: './createcustomers.html',
  styleUrls: ['./createcustomers.css'],
})
export class CreateCustomers {

 private api = inject(CustomerService);
  private router = inject(Router);
  private cancelLoad$ = new Subject<void>();
  customers: Customer[] = [];
  loading = false;
  saving = false;
  deletingId: string | null = null;
  error = '';

  model: CreateCustomer = { firstName: '', lastName: '', email: '', phone: '' };

  ngOnInit() {
    this.load();
  }

load() {
  // cancel any in-flight load (prevents a hung request from keeping loading=true)
  this.cancelLoad$.next();

  this.loading = true;
  this.error = '';

  this.api.list()
    .pipe(
      takeUntil(this.cancelLoad$),
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (e) => {
        this.error = 'Failed to load customers';
        console.error(e);
      }
    });
 }

  create() {
    if (!this.model.firstName || !this.model.lastName || !this.model.email) {
      this.error = 'First name, last name, and email are required.';
      return;
    }
    this.saving = true;
    this.error = '';
    const payload: CreateCustomer = {
      firstName: this.model.firstName.trim(),
      lastName: this.model.lastName.trim(),
      email: this.model.email.trim(),
      phone: (this.model.phone || '').trim() || undefined
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.model = { firstName: '', lastName: '', email: '', phone: '' };
        this.saving = false;
        this.router.navigateByUrl('/customers');
      },
      error: (e) => { this.error = 'Failed to create customer'; this.saving = false; console.error(e); }
    });
  }

  // remove(id: string) {
  //   this.deletingId = id;
  //   this.error = '';
  //   this.api.delete(id).subscribe({
  //     next: () => { this.deletingId = null; this.load(); },
  //     error: (e) => { this.error = 'Failed to delete customer'; this.deletingId = null; console.error(e); }
  //   });
  // }

  // control panels state in Angular to avoid conflicts with bootstrap JS
  openPanels = [true, false, false];

  toggle(index: number) {
    this.openPanels[index] = !this.openPanels[index];
  }

  ngOnDestroy() {
  this.cancelLoad$.next();
  this.cancelLoad$.complete();
 }

}
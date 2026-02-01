import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer, CreateCustomer } from '../services/customer.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css'],
})
export class Customers {
  private api = inject(CustomerService);
  private cancelLoad$ = new Subject<void>();
  customers: Customer[] = [];
  loading = false;
  saving = false;
  deletingId: string | null = null;
  editingId: string | null = null;
  error = '';

  model: CreateCustomer = { firstName: '', lastName: '', email: '', phone: '' };

  ngOnInit() {
    // If the server rendered and embedded state is present, hydrate from it
    if (typeof window !== 'undefined') {
      try {
        const el = document.getElementById('ng-state');
        if (el && el.textContent) {
          const state = JSON.parse(el.textContent || '{}');
          for (const k of Object.keys(state)) {
            const entry: any = state[k];
            if (entry && Array.isArray(entry.b)) {
              this.customers = entry.b as Customer[];
              this.loading = false;
              break;
            }
          }
        }
      } catch (e) {
        // fall through to normal load
      }
    }

    this.load();
  }

load() {
  // cancel any in-flight load (prevents a hung request from keeping loading=true)
  this.cancelLoad$.next();
  // recreate the notifier so future loads can be cancelled independently
  this.cancelLoad$ = new Subject<void>();

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
    console.log('Creating customer with data:', this.model);
    this.saving = true;
    this.error = '';
    const payload: CreateCustomer = {
      firstName: this.model.firstName.trim(),
      lastName: this.model.lastName.trim(),
      email: this.model.email.trim(),
      phone: (this.model.phone || '').trim() || undefined
    };

    this.api.create(payload).subscribe({
      next: (created) => {
        this.model = { firstName: '', lastName: '', email: '', phone: '' };
        this.customers = [created, ...this.customers];
        this.saving = false;
      },
      error: (e) => { this.error = 'Failed to create customer'; this.saving = false; console.error(e); }
    });
  }

  remove(id: string) {
    console.log('Deleting customer with ID:', id);
    this.deletingId = id;
    this.error = '';
    this.api.delete(id).subscribe({
      next: () => {
        // Optimistically remove from local list so UI updates immediately
        this.customers = this.customers.filter((c) => c._id !== id);
        this.deletingId = null;
      },
      error: (e) => { this.error = 'Failed to delete customer'; this.deletingId = null; console.error(e); }
    });
  }

  ngOnDestroy() {
  this.cancelLoad$.next();
  this.cancelLoad$.complete();
 }

  edit(id: string) {
    console.log('Editing customer with ID:', id);
    const c = this.customers.find((x) => x._id === id);
    if (!c) return;
    this.editingId = id;
    this.model = { firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone };
  }

  cancelEdit() {
    console.log('Cancelling edit');
    this.editingId = null;
    this.model = { firstName: '', lastName: '', email: '', phone: '' };
    this.error = '';
  }

  saveEdit() {
    console.log('Saving edit for customer with ID:', this.editingId);
    if (!this.editingId) return this.create();
    if (!this.model.firstName || !this.model.lastName || !this.model.email) {
      this.error = 'First name, last name, and email are required.';
      return;
    }
    this.saving = true;
    this.error = '';
    const payload: Partial<CreateCustomer> = {
      firstName: this.model.firstName.trim(),
      lastName: this.model.lastName.trim(),
      email: this.model.email.trim(),
      phone: (this.model.phone || '').trim() || undefined,
    };
    console.log('Updating customer with data:', payload);
    this.api.update(this.editingId, payload).subscribe({
      next: (updated) => {
        console.log('Successfully updated customer with ID:', this.editingId, updated);
        this.cancelEdit();
        this.customers = this.customers.map((c) => (c._id === updated._id ? updated : c));
        this.saving = false;
      },
      error: (e) => {
        console.log('Failed to update customer with ID:', this.editingId, e);
        this.error = 'Failed to update customer';
        this.saving = false;
        console.error(e);
      }
    });
  }

}
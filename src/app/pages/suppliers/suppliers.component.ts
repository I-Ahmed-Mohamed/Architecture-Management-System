import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);
  searchTerm = signal('');
  categoryFilter = signal('');

  selectedSupplier = signal<any>(null);

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    category: ['مورد خامات', Validators.required],
    specialty: ['', Validators.required],
    phone: ['', Validators.required]
  });

  filteredSuppliers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.categoryFilter();
    
    return this.dataService.suppliers().filter(s => {
      const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.specialty.toLowerCase().includes(term) || s.phone.includes(term);
      const matchesCat = !cat || s.category === cat;
      return matchesSearch && matchesCat;
    });
  });

  supplierTransactions = computed(() => {
    const sup = this.selectedSupplier();
    if (!sup) return [];
    return this.dataService.supplierTransactions().filter(tx => tx.supplierId === sup.id);
  });

  totalInvoiced = computed(() => {
    return this.supplierTransactions().filter(tx => tx.type === 'invoice').reduce((s, tx) => s + tx.amount, 0);
  });

  totalPaid = computed(() => {
    return this.supplierTransactions().filter(tx => tx.type === 'payment').reduce((s, tx) => s + tx.amount, 0);
  });

  remainingBalance = computed(() => {
    return this.totalInvoiced() - this.totalPaid();
  });

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) this.supplierForm.reset({ category: 'مورد خامات' });
  }

  onSubmit() {
    if (this.supplierForm.valid) {
      this.dataService.addSupplier({
        name: this.supplierForm.value.name!,
        category: this.supplierForm.value.category as any,
        specialty: this.supplierForm.value.specialty!,
        phone: this.supplierForm.value.phone!
      });
      this.toggleForm();
    }
  }

  openStatement(supplier: any) {
    this.selectedSupplier.set(supplier);
  }

  closeStatement() {
    this.selectedSupplier.set(null);
  }
}

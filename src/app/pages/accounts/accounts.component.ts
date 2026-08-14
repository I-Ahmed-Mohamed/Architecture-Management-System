import { Component, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
}

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent {
  transactions = signal<Transaction[]>([
    { id: 'TRX-101', date: '2026-08-14', description: 'دفعة مقدمة - فيلا التجمع', amount: 50000, type: 'income', status: 'completed' },
    { id: 'TRX-102', date: '2026-08-12', description: 'شراء أجهزة مكتبية (لابتوب)', amount: 28000, type: 'expense', status: 'completed' },
    { id: 'TRX-103', date: '2026-08-10', description: 'دفع رواتب المهندسين (يوليو)', amount: 45000, type: 'expense', status: 'completed' },
    { id: 'TRX-104', date: '2026-08-05', description: 'مستخلص تصميم - مشروع العاصمة', amount: 15000, type: 'income', status: 'pending' }
  ]);

  showForm = signal(false);
  trxForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.trxForm = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      type: ['income', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.trxForm.valid) {
      const formValue = this.trxForm.value;
      const newTrx: Transaction = {
        id: 'TRX-' + Math.floor(Math.random() * 900 + 100),
        date: formValue.date,
        description: formValue.description,
        amount: Number(formValue.amount),
        type: formValue.type,
        status: 'completed'
      };
      
      this.transactions.update(trxs => [newTrx, ...trxs]);
      this.trxForm.reset({ type: 'income', date: new Date().toISOString().split('T')[0] });
      this.showForm.set(false);
    }
  }

  getTotalIncome() {
    return this.transactions().filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses() {
    return this.transactions().filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance() {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
}

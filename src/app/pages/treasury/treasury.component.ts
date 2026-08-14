import { Component, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

interface TreasuryMovement {
  id: string;
  date: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  handledBy: string;
}

@Component({
  selector: 'app-treasury',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './treasury.component.html',
  styleUrl: './treasury.component.css'
})
export class TreasuryComponent {
  movements = signal<TreasuryMovement[]>([
    { id: 'TR-501', date: '2026-08-14T10:00:00', type: 'in', amount: 10000, reason: 'سلفة مستردة', handledBy: 'سارة خالد' },
    { id: 'TR-502', date: '2026-08-13T14:30:00', type: 'out', amount: 2500, reason: 'مصروفات نثرية للموقع', handledBy: 'محمود سعد' },
    { id: 'TR-503', date: '2026-08-11T09:15:00', type: 'in', amount: 50000, reason: 'إيداع من حساب البنك للرواتب', handledBy: 'المهندس' }
  ]);

  currentBalance = signal<number>(125000); // Dummy initial balance

  getTotalIn() {
    return this.movements().filter(m => m.type === 'in').reduce((sum, m) => sum + m.amount, 0);
  }

  getTotalOut() {
    return this.movements().filter(m => m.type === 'out').reduce((sum, m) => sum + m.amount, 0);
  }
}

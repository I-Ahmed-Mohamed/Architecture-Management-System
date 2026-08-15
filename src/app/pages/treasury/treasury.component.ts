import { Component, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

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
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './treasury.component.html',
  styleUrl: './treasury.component.css'
})
export class TreasuryComponent {
  showForm = signal<boolean>(false);
  formType = signal<'in' | 'out'>('in');

  treasuryForm = new FormGroup({
    amount: new FormControl('', Validators.required),
    reason: new FormControl('', Validators.required),
    handledBy: new FormControl('', Validators.required)
  });

  toggleForm(type?: 'in' | 'out') {
    if (type) {
      this.formType.set(type);
      this.showForm.set(true);
    } else {
      this.showForm.set(!this.showForm());
    }
    if (!this.showForm()) {
      this.treasuryForm.reset();
    }
  }

  onSubmit() {
    if (this.treasuryForm.valid) {
      // Dummy submit
      this.toggleForm();
    }
  }
  movements = signal<TreasuryMovement[]>([
    { id: 'TR-501', date: '2026-08-14T10:00:00', type: 'in', amount: 10000, reason: 'سلفة مستردة', handledBy: 'سارة خالد' },
    { id: 'TR-502', date: '2026-08-13T14:30:00', type: 'out', amount: 2500, reason: 'مصروفات نثرية للموقع', handledBy: 'محمود سعد' },
    { id: 'TR-503', date: '2026-08-11T09:15:00', type: 'in', amount: 50000, reason: 'إيداع من حساب البنك للرواتب', handledBy: 'المهندس' }
  ]);

  currentBalance = signal<number>(125000); // Dummy initial balance

  egyptianBanks = [
    'البنك الأهلي المصري (NBE)',
    'بنك مصر (Banque Misr)',
    'البنك التجاري الدولي (CIB)',
    'بنك القاهرة (Banque du Caire)',
    'بنك الإسكندرية (AlexBank)',
    'البنك العربي الأفريقي الدولي (AAIB)',
    'بنك قطر الوطني الأهلي (QNB Alahli)',
    'بنك التعمير والإسكان (HDB)',
    'بنك فيصل الإسلامي',
    'البنك الكويتي الوطني (NBK)',
    'مصرف أبوظبي الإسلامي (ADIB)',
    'بنك إتش إس بي سي (HSBC)',
    'كريدي أجريكول (Crédit Agricole)',
    'بنك الإمارات دبي الوطني (Emirates NBD)',
    'البنك المصري الخليجي (EG Bank)',
    'المصرف المتحد (The United Bank)',
    'بنك الشركة المصرفية العربية الدولية (SAIB)',
    'بنك التنمية الصناعية',
    'البنك العقاري المصري العربي',
    'بنك قناة السويس',
    'البنك الأهلي الكويتي (ABK)',
    'فودافون كاش (Vodafone Cash)',
    'انستا باي (InstaPay)',
    'أخرى (Other)'
  ];

  activeTab = signal<'cash' | 'checks'>('cash');
  showCheckForm = signal<boolean>(false);

  checkForm = new FormGroup({
    checkNumber: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    dueDate: new FormControl('', Validators.required),
    payee: new FormControl('', Validators.required),
    bankName: new FormControl('', Validators.required),
    type: new FormControl<'in' | 'out'>('in', Validators.required),
    status: new FormControl<'pending' | 'cleared' | 'bounced'>('pending', Validators.required)
  });

  treasuryForm = new FormGroup({
    amount: new FormControl('', Validators.required),
    reason: new FormControl('', Validators.required),
    handledBy: new FormControl('', Validators.required),
    paymentMethod: new FormControl('كاش (خزينة)', Validators.required)
  });

  toggleCheckForm() {
    this.showCheckForm.set(!this.showCheckForm());
    if (!this.showCheckForm()) {
      this.checkForm.reset({ type: 'in', status: 'pending', bankName: '' });
    }
  }

  onCheckSubmit() {
    if (this.checkForm.valid) {
      const formVal = this.checkForm.value;
      const newCheck = {
        id: formVal.checkNumber as string,
        amount: Number(formVal.amount),
        dueDate: formVal.dueDate as string,
        payee: formVal.payee as string,
        bankName: formVal.bankName as string,
        type: formVal.type as 'in' | 'out',
        status: formVal.status as 'pending' | 'cleared' | 'bounced'
      };
      this.checks.update(c => [newCheck, ...c]);
      this.toggleCheckForm();
    }
  }

  checks = signal<any[]>([
    { id: 'CHK-100234', amount: 25000, dueDate: '2026-08-20', payee: 'شركة الأفق', type: 'in', status: 'pending' },
    { id: 'CHK-998822', amount: 15000, dueDate: '2026-08-15', payee: 'مورد دهانات', type: 'out', status: 'cleared' },
    { id: 'CHK-112233', amount: 50000, dueDate: '2026-08-30', payee: 'أحمد محمود', type: 'in', status: 'pending' }
  ]);

  getTotalPendingChecks() {
    return this.checks().filter(c => c.status === 'pending').length;
  }

  getTotalChecksIn() {
    return this.checks().filter(c => c.type === 'in' && c.status === 'cleared').reduce((sum, c) => sum + c.amount, 0);
  }

  getTotalChecksOut() {
    return this.checks().filter(c => c.type === 'out' && c.status === 'cleared').reduce((sum, c) => sum + c.amount, 0);
  }

  getTotalIn() {
    return this.movements().filter(m => m.type === 'in').reduce((sum, m) => sum + m.amount, 0);
  }

  getTotalOut() {
    return this.movements().filter(m => m.type === 'out').reduce((sum, m) => sum + m.amount, 0);
  }
}

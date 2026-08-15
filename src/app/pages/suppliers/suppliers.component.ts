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

  printDirect(supplier: any) {
    const transactions = this.dataService.supplierTransactions().filter(tx => tx.supplierId === supplier.id);
    const totalInvoiced = transactions.filter(tx => tx.type === 'invoice').reduce((s, tx) => s + tx.amount, 0);
    const totalPaid = transactions.filter(tx => tx.type === 'payment').reduce((s, tx) => s + tx.amount, 0);
    const remaining = totalInvoiced - totalPaid;
    const datePipe = new DatePipe('en-US');
    const todayStr = datePipe.transform(new Date(), 'yyyy-MM-dd');
    const currencyPipe = new CurrencyPipe('en-US');
    const formatCurrency = (val: number) => currencyPipe.transform(val, 'EGP', 'symbol', '1.0-0');

    let rowsHtml = '';
    if (transactions.length > 0) {
      for (const tx of transactions) {
        rowsHtml += `
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">${tx.date}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${tx.description}</td>
            <td style="border: 1px solid #000; padding: 8px;">${tx.type === 'invoice' ? formatCurrency(tx.amount) : '-'}</td>
            <td style="border: 1px solid #000; padding: 8px;">${tx.type === 'payment' ? formatCurrency(tx.amount) : '-'}</td>
          </tr>
        `;
      }
    } else {
      rowsHtml = `<tr><td colspan="4" style="border: 1px solid #000; padding: 15px; text-align: center;">لا توجد حركات مسجلة.</td></tr>`;
    }

    const htmlContent = `
        <div style="background: #ffffff; color: #000000; padding: 20px; border: 1px solid #ddd; font-family: sans-serif; direction: rtl;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h2 style="margin: 0 0 5px 0; font-size: 24px; color: #000;">كشف حساب مورد / مقاول</h2>
              <p style="margin: 0; color: #333; font-weight: bold;">شركة Nest Designs للمقاولات</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">تاريخ الإصدار: ${todayStr}</p>
            </div>
            <div style="text-align: left;">
              <img src="${window.location.origin}/assets/logo.jpg" alt="Logo" style="height: 50px; border-radius: 8px;">
            </div>
          </div>

          <div style="margin-bottom: 20px; border: 1px solid #000; padding: 15px;">
            <table style="width: 100%; border: none; font-size: 14px;">
              <tr>
                <td style="padding: 5px; border: none; width: 50%;"><strong>الاسم:</strong> ${supplier.name}</td>
                <td style="padding: 5px; border: none;"><strong>التصنيف:</strong> ${supplier.category}</td>
              </tr>
              <tr>
                <td style="padding: 5px; border: none;"><strong>رقم الهاتف:</strong> <span dir="ltr">${supplier.phone}</span></td>
                <td style="padding: 5px; border: none;"><strong>التخصص:</strong> ${supplier.specialty}</td>
              </tr>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #000; padding: 12px; font-weight: bold; font-size: 15px; background-color: #f9f9f9;">
            <div style="text-align: center; flex: 1; border-left: 1px solid #ccc;">إجمالي المسحوبات (له)<br><span style="font-size: 18px;">${formatCurrency(totalInvoiced)}</span></div>
            <div style="text-align: center; flex: 1; border-left: 1px solid #ccc;">إجمالي المدفوعات (عليه)<br><span style="font-size: 18px;">${formatCurrency(totalPaid)}</span></div>
            <div style="text-align: center; flex: 1;">الرصيد المتبقي له<br><span style="font-size: 18px; color: #FF3B30;">${formatCurrency(remaining)}</span></div>
          </div>

          <h4 style="margin: 0 0 10px 0; color: #000;">سجل الحركات:</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: center; font-size: 14px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 10px;">التاريخ</th>
                <th style="border: 1px solid #000; padding: 10px;">البيان</th>
                <th style="border: 1px solid #000; padding: 10px;">مسحوبات (له)</th>
                <th style="border: 1px solid #000; padding: 10px;">مدفوعات (عليه)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
    `;

    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (WindowPrt) {
      WindowPrt.document.write(`
        <html dir="rtl">
          <head>
            <title>كشف حساب مورد - ${supplier.name}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #000; background: #fff; -webkit-print-color-adjust: exact; color-adjust: exact; print-color-adjust: exact; }
              @page { size: A4; margin: 15mm; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      WindowPrt.document.close();
      WindowPrt.focus();
      setTimeout(() => {
        WindowPrt.print();
        WindowPrt.close();
      }, 500);
    }
  }
}

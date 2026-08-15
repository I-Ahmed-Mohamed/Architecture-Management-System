import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);
  searchTerm = signal('');
  startDate = signal('');
  endDate = signal('');
  today = new Date();
  
  selectedClient = signal<any>(null);

  clientContracts = computed(() => {
    const client = this.selectedClient();
    if (!client) return [];
    return this.dataService.contracts().filter(c => c.clientId === client.id);
  });

  clientTotalContracts = computed(() => {
    return this.clientContracts().reduce((sum, c) => sum + c.value, 0);
  });

  clientTotalPaid = computed(() => {
    return this.clientContracts().reduce((sum, c) => sum + c.paid, 0);
  });

  clientRemaining = computed(() => {
    return this.clientTotalContracts() - this.clientTotalPaid();
  });

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const start = this.startDate() ? new Date(this.startDate()) : null;
    const end = this.endDate() ? new Date(this.endDate()) : null;
    
    const clients = this.dataService.clients() || [];
    
    return clients.filter(c => {
      const matchesSearch = !term || 
        c.name.toLowerCase().includes(term) || 
        c.branchName.toLowerCase().includes(term) ||
        c.phone.includes(term) || 
        c.email.toLowerCase().includes(term);
        
      let matchesDate = true;
      if (start || end) {
        // Simple mock date filtering if implemented
      }
      
      return matchesSearch && matchesDate;
    });
  });

  clientForm = this.fb.group({
    name: ['', Validators.required],
    branchName: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.dataService.addClient({
        name: this.clientForm.value.name!,
        branchName: this.clientForm.value.branchName!,
        phone: this.clientForm.value.phone!,
        email: this.clientForm.value.email!
      });
      this.clientForm.reset();
      this.showForm.set(false);
    }
  }

  openStatement(client: any) {
    this.selectedClient.set(client);
  }

  closeStatement() {
    this.selectedClient.set(null);
  }

  exportStatementPDF() {
    const printContent = document.getElementById('printableStatement');
    if (!printContent) return;

    // We can use a clean popup window to print the specific element
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (WindowPrt) {
      WindowPrt.document.write(`
        <html dir="rtl">
          <head>
            <title>كشف حساب عميل - ${this.selectedClient()?.name}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 20px; 
                color: #000; 
                background: #fff;
                -webkit-print-color-adjust: exact; 
                color-adjust: exact;
                print-color-adjust: exact;
              }
              @page { size: A4; margin: 15mm; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      WindowPrt.document.close();
      WindowPrt.focus();
      // Give images a moment to load if any
      setTimeout(() => {
        WindowPrt.print();
        WindowPrt.close();
      }, 500);
    }
  }
  printDirect(client: any) {
    const contracts = this.dataService.contracts().filter(c => c.clientId === client.id);
    const totalContracts = contracts.reduce((sum, c) => sum + c.value, 0);
    const totalPaid = contracts.reduce((sum, c) => sum + c.paid, 0);
    const remaining = totalContracts - totalPaid;
    const datePipe = new DatePipe('en-US');
    const todayStr = datePipe.transform(new Date(), 'yyyy-MM-dd');
    const currencyPipe = new CurrencyPipe('en-US');
    const formatCurrency = (val: number) => currencyPipe.transform(val, 'EGP', 'symbol', '1.0-0');

    let rowsHtml = '';
    if (contracts.length > 0) {
      for (const contract of contracts) {
        rowsHtml += `
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">${contract.date}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">عقد رقم ${contract.id}</td>
            <td style="border: 1px solid #000; padding: 8px;">${formatCurrency(contract.value)}</td>
            <td style="border: 1px solid #000; padding: 8px;">تعاقد</td>
          </tr>
        `;
        if (contract.paid > 0) {
          rowsHtml += `
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${contract.date}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;">دفعة لعقد رقم ${contract.id}</td>
              <td style="border: 1px solid #000; padding: 8px;">${formatCurrency(contract.paid)}</td>
              <td style="border: 1px solid #000; padding: 8px;">سداد</td>
            </tr>
          `;
        }
      }
    } else {
      rowsHtml = `<tr><td colspan="4" style="border: 1px solid #000; padding: 15px; text-align: center;">لا توجد تعاقدات مسجلة للعميل.</td></tr>`;
    }

    const htmlContent = `
        <div style="background: #ffffff; color: #000000; padding: 20px; border: 1px solid #ddd; font-family: sans-serif; direction: rtl;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h2 style="margin: 0 0 5px 0; font-size: 24px; color: #000;">كشف حساب عميل</h2>
              <p style="margin: 0; color: #333; font-weight: bold;">شركة Nest Designs للمقاولات</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">تاريخ الإصدار: ${todayStr}</p>
            </div>
            <div style="text-align: left;">
              <img src="assets/logo.jpg" alt="Logo" style="height: 50px; border-radius: 8px;">
            </div>
          </div>

          <div style="margin-bottom: 20px; border: 1px solid #000; padding: 15px;">
            <table style="width: 100%; border: none; font-size: 14px;">
              <tr>
                <td style="padding: 5px; border: none; width: 50%;"><strong>اسم العميل:</strong> ${client.name}</td>
                <td style="padding: 5px; border: none;"><strong>الفرع:</strong> ${client.branchName}</td>
              </tr>
              <tr>
                <td style="padding: 5px; border: none;"><strong>رقم الهاتف:</strong> <span dir="ltr">${client.phone}</span></td>
                <td style="padding: 5px; border: none;"><strong>كود العميل:</strong> #${client.id}</td>
              </tr>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #000; padding: 12px; font-weight: bold; font-size: 15px; background-color: #f9f9f9;">
            <div style="text-align: center; flex: 1; border-left: 1px solid #ccc;">إجمالي التعاقدات<br><span style="font-size: 18px;">${formatCurrency(totalContracts)}</span></div>
            <div style="text-align: center; flex: 1; border-left: 1px solid #ccc;">إجمالي المسدد<br><span style="font-size: 18px;">${formatCurrency(totalPaid)}</span></div>
            <div style="text-align: center; flex: 1;">الرصيد المتبقي<br><span style="font-size: 18px;">${formatCurrency(remaining)}</span></div>
          </div>

          <h4 style="margin: 0 0 10px 0; color: #000;">سجل الحركات:</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: center; font-size: 14px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 10px;">التاريخ</th>
                <th style="border: 1px solid #000; padding: 10px;">البيان</th>
                <th style="border: 1px solid #000; padding: 10px;">المبلغ</th>
                <th style="border: 1px solid #000; padding: 10px;">النوع</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top: 40px; padding: 0 20px;">
            <div style="text-align: center;">
              <p style="margin-bottom: 30px; font-weight: bold;">توقيع المحاسب</p>
              <p>.......................</p>
            </div>
            <div style="text-align: center;">
              <p style="margin-bottom: 30px; font-weight: bold;">توقيع العميل / المستلم</p>
              <p>.......................</p>
            </div>
          </div>
        </div>
    `;

    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (WindowPrt) {
      WindowPrt.document.write(`
        <html dir="rtl">
          <head>
            <title>كشف حساب عميل - ${client.name}</title>
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

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
}

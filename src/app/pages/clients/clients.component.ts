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

  async exportStatementPDF() {
    const data = document.getElementById('printableStatement');
    if (!data) return;

    try {
      const canvas = await html2canvas(data, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.body.classList.contains('light-theme') ? '#f2f2f7' : '#000000'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      
      pdf.save(`Account_Statement_${this.selectedClient()?.name}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('حدث خطأ أثناء تصدير ملف الـ PDF.');
    }
  }
}

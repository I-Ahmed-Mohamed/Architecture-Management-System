import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css'
})
export class ContractsComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);
  isGeneratingPDF = signal(false);

  // Filters
  searchTerm = signal('');
  startDate = signal('');
  endDate = signal('');

  filteredContracts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const start = this.startDate() ? new Date(this.startDate()).getTime() : null;
    const end = this.endDate() ? new Date(this.endDate()).getTime() : null;
    
    let contracts = this.dataService.contracts() || [];
    
    return contracts.filter(c => {
      const matchesSearch = !term || 
        c.clientName.toLowerCase().includes(term) || 
        c.branchName.toLowerCase().includes(term) ||
        (c.poNumber && c.poNumber.toLowerCase().includes(term));
        
      let matchesDate = true;
      if (start || end) {
        // Simple mock date filtering (since data might be local strings like '1 أغسطس 2026')
        // In real app, we'd compare proper timestamp objects.
        // We'll leave it true if they are simple strings for now, or just fallback to true.
      }
      
      return matchesSearch && matchesDate;
    });
  });

  contractForm = this.fb.group({
    clientId: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(1)]],
    taxId: [''],
    poNumber: [''],
    status: ['draft', Validators.required]
  });

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.contractForm.valid) {
      this.dataService.addContract({
        clientId: this.contractForm.value.clientId!,
        value: Number(this.contractForm.value.value),
        taxId: this.contractForm.value.taxId || '',
        poNumber: this.contractForm.value.poNumber || '',
        status: this.contractForm.value.status as any
      });
      this.contractForm.reset({ status: 'draft', value: 0 });
      this.showForm.set(false);
    }
  }

  async downloadPDF(contract: any, contractElement: HTMLElement) {
    this.isGeneratingPDF.set(true);
    try {
      const canvas = await html2canvas(contractElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`contract-${contract.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      this.isGeneratingPDF.set(false);
    }
  }
}

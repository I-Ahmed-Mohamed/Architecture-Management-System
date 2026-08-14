import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
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

  contractForm = this.fb.group({
    clientId: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(1)]],
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
        backgroundColor: '#ffffff' // White background for PDF
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

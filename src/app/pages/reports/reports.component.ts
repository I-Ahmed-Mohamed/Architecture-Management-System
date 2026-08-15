import { Component, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DataService } from '../../services/data.service';
import { CurrencyPipe } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [BaseChartDirective, CurrencyPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  dataService = inject(DataService);

  // Revenue vs Expenses Bar Chart
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'الإيرادات والمصروفات خلال 6 أشهر' }
    }
  };
  
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'],
    datasets: [
      { data: [65000, 59000, 80000, 81000, 56000, 150000], label: 'الإيرادات', backgroundColor: '#34C759', borderRadius: 6 },
      { data: [28000, 48000, 40000, 19000, 86000, 27000], label: 'المصروفات', backgroundColor: '#FF3B30', borderRadius: 6 }
    ]
  };

  // Projects Status Doughnut Chart
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['مشاريع مكتملة', 'قيد التنفيذ', 'متوقفة', 'ملغاة'],
    datasets: [{
      data: [12, 5, 2, 1],
      backgroundColor: ['#34C759', '#0A84FF', '#FF9500', '#FF3B30'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  async exportPDF() {
    const data = document.getElementById('printableReport');
    if (!data) return;

    try {
      const canvas = await html2canvas(data, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: document.body.classList.contains('light-theme') ? '#f2f2f7' : '#000000'
      });

      const imgWidth = 210; // A4 size in mm
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add Company Header
      pdf.setFontSize(22);
      pdf.setTextColor(10, 132, 255);
      pdf.text('Nest Designs', 105, 20, { align: 'center' });
      pdf.setFontSize(14);
      pdf.setTextColor(100);
      pdf.text('التقرير المالي والإحصائي الشامل', 105, 30, { align: 'center' });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);
      
      pdf.save('Financial_Report.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('حدث خطأ أثناء تصدير ملف الـ PDF.');
    }
  }

  exportExcel() {
    // Generate data array for Excel
    const data = [
      ['الشهر', 'الإيرادات', 'المصروفات', 'الصافي', 'معدل النمو'],
      ['أغسطس 2026', 150000, 27000, 123000, '15%'],
      ['يوليو 2026', 56000, 86000, -30000, '-12%'],
      ['يونيو 2026', 81000, 19000, 62000, '5%']
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقرير المالي');

    XLSX.writeFile(wb, 'Financial_Report.xlsx');
  }
}

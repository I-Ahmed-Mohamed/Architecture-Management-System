import { Component, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DataService } from '../../services/data.service';
import { CurrencyPipe } from '@angular/common';

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

  exportPDF() {
    alert('جاري تجهيز وتصدير التقرير بصيغة PDF...');
  }

  exportExcel() {
    alert('جاري تصدير التقرير بصيغة Excel...');
  }
}

import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  dataService = inject(DataService);

  // Pie Chart Data (Project Phases)
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };
  
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['التصميم 2D', 'مقترحات الـ 3D', 'الإشراف على التشطيب'],
    datasets: [{
      data: [3, 5, 2], // Dummy initial data, in a real scenario we compute this
      backgroundColor: ['#d4af37', '#2a2a2a', '#e0e0e0']
    }]
  };

  // Bar Chart Data (Revenue)
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };
  
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      { data: [65000, 59000, 80000, 81000, 56000, 150000], label: 'الإيرادات الشهرية', backgroundColor: '#d4af37' }
    ]
  };
}

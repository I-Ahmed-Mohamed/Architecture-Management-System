import { Component, signal } from '@angular/core';

interface Asset {
  code: string;
  name: string;
  category: string;
  purchaseValue: number;
  assignedTo: string;
  status: 'good' | 'maintenance' | 'broken';
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.css'
})
export class AssetsComponent {
  assets = signal<Asset[]>([
    { code: 'AST-001', name: 'لابتوب ديل', category: 'أجهزة كمبيوتر', purchaseValue: 35000, assignedTo: 'أحمد محمد', status: 'good' },
    { code: 'AST-002', name: 'شاشة عرض تفاعلية', category: 'أجهزة مكتبية', purchaseValue: 22000, assignedTo: 'غرفة الاجتماعات', status: 'good' },
    { code: 'AST-003', name: 'جهاز مساحة Total Station', category: 'معدات هندسية', purchaseValue: 120000, assignedTo: 'محمود سعد', status: 'maintenance' },
    { code: 'AST-004', name: 'طابعة ليزر A3', category: 'أجهزة مكتبية', purchaseValue: 15000, assignedTo: 'الإدارة', status: 'good' }
  ]);
}

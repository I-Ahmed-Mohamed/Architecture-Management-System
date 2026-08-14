import { Component, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';

export interface Asset {
  id: string;
  name: string;
  category: string;
  purchaseValue: number;
  purchaseDate: string;
  usefulLifeYears: number;
  depreciationMethod: 'straight_line';
  assignedTo: string;
  status: 'good' | 'maintenance' | 'broken';
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.css'
})
export class AssetsComponent {
  assets = signal<Asset[]>([
    { id: 'AST-001', name: 'لابتوب ديل XPS', category: 'أجهزة كمبيوتر', purchaseValue: 35000, purchaseDate: '2024-01-15', usefulLifeYears: 5, depreciationMethod: 'straight_line', assignedTo: 'أحمد محمد', status: 'good' },
    { id: 'AST-002', name: 'شاشة عرض تفاعلية 65 بوصة', category: 'أجهزة مكتبية', purchaseValue: 22000, purchaseDate: '2023-06-10', usefulLifeYears: 5, depreciationMethod: 'straight_line', assignedTo: 'غرفة الاجتماعات', status: 'good' },
    { id: 'AST-003', name: 'جهاز مساحة Leica Total Station', category: 'معدات هندسية', purchaseValue: 120000, purchaseDate: '2021-03-20', usefulLifeYears: 10, depreciationMethod: 'straight_line', assignedTo: 'محمود سعد', status: 'maintenance' },
    { id: 'AST-004', name: 'طابعة ليزر HP A3', category: 'أجهزة مكتبية', purchaseValue: 15000, purchaseDate: '2025-01-05', usefulLifeYears: 4, depreciationMethod: 'straight_line', assignedTo: 'الإدارة', status: 'good' },
    { id: 'AST-005', name: 'سيارة هيونداي (للموقع)', category: 'سيارات', purchaseValue: 850000, purchaseDate: '2022-08-01', usefulLifeYears: 5, depreciationMethod: 'straight_line', assignedTo: 'الشركة', status: 'good' }
  ]);

  viewMode = signal<'kanban' | 'list'>('kanban');
  searchTerm = signal('');
  showForm = signal(false);
  assetForm: FormGroup;

  // Computed signal for filtered assets
  filteredAssets = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.assets();
    return this.assets().filter(a => 
      a.name.toLowerCase().includes(term) || 
      a.id.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term) ||
      a.assignedTo.toLowerCase().includes(term)
    );
  });

  constructor(private fb: FormBuilder) {
    this.assetForm = this.fb.group({
      name: ['', Validators.required],
      category: ['أجهزة مكتبية', Validators.required],
      purchaseValue: [0, [Validators.required, Validators.min(1)]],
      purchaseDate: [new Date().toISOString().split('T')[0], Validators.required],
      usefulLifeYears: [5, [Validators.required, Validators.min(1)]],
      assignedTo: ['', Validators.required],
      status: ['good', Validators.required]
    });
  }

  // --- Accounting Calculations ---
  
  getYearsPassed(purchaseDateStr: string): number {
    const purchaseDate = new Date(purchaseDateStr);
    const currentDate = new Date();
    // Calculate difference in exact years (including fractions)
    const diffTime = Math.abs(currentDate.getTime() - purchaseDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, diffYears); // Cannot be negative
  }

  getAccumulatedDepreciation(asset: Asset): number {
    if (asset.usefulLifeYears <= 0) return asset.purchaseValue;
    
    const yearsPassed = this.getYearsPassed(asset.purchaseDate);
    const yearlyDepreciation = asset.purchaseValue / asset.usefulLifeYears;
    
    // Total accumulated shouldn't exceed purchase value
    const accumulated = yearlyDepreciation * yearsPassed;
    return Math.min(asset.purchaseValue, accumulated);
  }

  getNetBookValue(asset: Asset): number {
    return asset.purchaseValue - this.getAccumulatedDepreciation(asset);
  }

  getDepreciationPercentage(asset: Asset): number {
    const acc = this.getAccumulatedDepreciation(asset);
    return Math.min(100, Math.round((acc / asset.purchaseValue) * 100));
  }

  // --- UI Actions ---

  toggleViewMode(mode: 'kanban' | 'list') {
    this.viewMode.set(mode);
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.assetForm.valid) {
      const formValue = this.assetForm.value;
      const newAsset: Asset = {
        id: 'AST-' + Math.floor(Math.random() * 900 + 100),
        name: formValue.name,
        category: formValue.category,
        purchaseValue: Number(formValue.purchaseValue),
        purchaseDate: formValue.purchaseDate,
        usefulLifeYears: Number(formValue.usefulLifeYears),
        depreciationMethod: 'straight_line',
        assignedTo: formValue.assignedTo,
        status: formValue.status
      };
      
      this.assets.update(list => [newAsset, ...list]);
      this.assetForm.reset({
        category: 'أجهزة مكتبية',
        purchaseDate: new Date().toISOString().split('T')[0],
        usefulLifeYears: 5,
        status: 'good'
      });
      this.showForm.set(false);
    }
  }

  // --- Stats ---
  getTotalAssetsValue() {
    return this.assets().reduce((sum, a) => sum + a.purchaseValue, 0);
  }

  getTotalNetBookValue() {
    return this.assets().reduce((sum, a) => sum + this.getNetBookValue(a), 0);
  }
}

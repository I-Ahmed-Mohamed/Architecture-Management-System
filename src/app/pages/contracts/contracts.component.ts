import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css'
})
export class ContractsComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);

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
}

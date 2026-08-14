import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: 'active' | 'on_leave' | 'resigned';
}

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './hr.component.html',
  styleUrl: './hr.component.css'
})
export class HrComponent {
  employees = signal<Employee[]>([
    { id: 'EMP-001', name: 'المهندس أحمد محمد', role: 'مهندس معماري أول', department: 'التصميم الهندسي', salary: 15000, status: 'active' },
    { id: 'EMP-002', name: 'محمود سعد', role: 'مهندس موقع', department: 'الإشراف والتنفيذ', salary: 12000, status: 'active' },
    { id: 'EMP-003', name: 'سارة خالد', role: 'محاسب', department: 'الإدارة المالية', salary: 8000, status: 'on_leave' }
  ]);

  showForm = signal(false);
  empForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.empForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(1000)]]
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.empForm.valid) {
      const formValue = this.empForm.value;
      const newEmp: Employee = {
        id: 'EMP-' + Math.floor(Math.random() * 900 + 100),
        name: formValue.name,
        role: formValue.role,
        department: formValue.department,
        salary: Number(formValue.salary),
        status: 'active'
      };
      
      this.employees.update(emps => [newEmp, ...emps]);
      this.empForm.reset();
      this.showForm.set(false);
    }
  }

  getActiveCount() {
    return this.employees().filter(e => e.status === 'active').length;
  }
}

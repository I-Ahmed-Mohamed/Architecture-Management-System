import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);

  projectForm = this.fb.group({
    name: ['', Validators.required],
    clientId: ['', Validators.required],
    phase: ['', Validators.required],
    status: ['active', Validators.required]
  });

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.dataService.addProject({
        name: this.projectForm.value.name!,
        clientId: this.projectForm.value.clientId!,
        phase: this.projectForm.value.phase!,
        status: this.projectForm.value.status as any
      });
      this.projectForm.reset({ status: 'active' });
      this.showForm.set(false);
    }
  }
}

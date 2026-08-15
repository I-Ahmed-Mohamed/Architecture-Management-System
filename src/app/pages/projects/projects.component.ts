import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
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
    status: ['active', Validators.required],
    projectStatus: ['مرحلة التصميم'],
    progress: [0, [Validators.min(0), Validators.max(100)]]
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
        status: this.projectForm.value.status as any,
        projectStatus: this.projectForm.value.projectStatus || 'مرحلة التصميم',
        progress: this.projectForm.value.progress || 0
      });
      this.projectForm.reset({ status: 'active', projectStatus: 'مرحلة التصميم', progress: 0 });
      this.showForm.set(false);
    }
  }
}

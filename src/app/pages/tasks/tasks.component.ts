import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  dataService = inject(DataService);

  showForm = signal<boolean>(false);
  taskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    project: new FormControl('', Validators.required),
    priority: new FormControl('normal', Validators.required)
  });

  getTasks(status: string) {
    return this.dataService.tasks().filter(t => t.status === status);
  }

  moveTask(task: any, newStatus: string) {
    this.dataService.updateTaskStatus(task.id, newStatus);
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.taskForm.reset({ priority: 'normal' });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      // Dummy submit
      this.toggleForm();
    }
  }
}

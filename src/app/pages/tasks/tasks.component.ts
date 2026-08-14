import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  dataService = inject(DataService);

  getTasks(status: string) {
    return this.dataService.tasks().filter(t => t.status === status);
  }

  moveTask(task: any, newStatus: string) {
    this.dataService.updateTaskStatus(task.id, newStatus);
  }
}

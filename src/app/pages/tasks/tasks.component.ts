import { Component } from '@angular/core';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  tasks = [
    { id: 1, title: 'معاينة فيلا التجمع', project: 'فيلا سكنية - التجمع الخامس', status: 'todo', date: '15 أغسطس 2026' },
    { id: 2, title: 'تسليم مخططات 2D', project: 'مقر إداري - العاصمة الجديدة', status: 'in-progress', date: '16 أغسطس 2026' },
    { id: 3, title: 'الاجتماع مع العميل لاختيار الخامات', project: 'شقة سكنية - الشيخ زايد', status: 'todo', date: '18 أغسطس 2026' },
    { id: 4, title: 'اعتماد عقد التصميم', project: 'فيلا سكنية - التجمع الخامس', status: 'done', date: '12 أغسطس 2026' },
  ];

  getTasks(status: string) {
    return this.tasks.filter(t => t.status === status);
  }

  moveTask(task: any, newStatus: string) {
    task.status = newStatus;
  }
}

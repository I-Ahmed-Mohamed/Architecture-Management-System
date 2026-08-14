import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Project, Contract } from '../../models';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);

  project: Project | undefined;
  contract: Contract | undefined;
  projectTasks: any[] = [];
  progressPercent = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.project = this.dataService.projects().find(p => p.id === id);
        
        if (this.project) {
          // Find associated contract
          this.contract = this.dataService.contracts().find(c => c.clientId === this.project?.clientId);
          
          // Find tasks for this project
          this.projectTasks = this.dataService.tasks().filter(t => t.project === this.project?.name);
          
          this.calculateProgress();
        }
      }
    });
  }

  calculateProgress() {
    if (!this.project) return;
    
    // Simple mock logic based on phase
    const phases = ['معاينة ورفع مقاسات', 'التصميم المعماري 2D', 'مقترحات الثري دي (3D)', 'الإشراف على التشطيب'];
    const phaseIndex = phases.indexOf(this.project.phase);
    
    if (this.project.status === 'completed') {
      this.progressPercent = 100;
    } else if (phaseIndex >= 0) {
      this.progressPercent = Math.max(25, (phaseIndex + 1) * 25);
    } else {
      this.progressPercent = 10; // pending or unknown
    }
  }

  triggerUpload(input: HTMLInputElement) {
    input.click();
  }

  onFileSelected(event: any) {
    // Mock upload action
    const file = event.target.files[0];
    if (file) {
      this.dataService.logActivity(`تم رفع ملف جديد (${file.name}) للمشروع: ${this.project?.name}`);
      alert(`تم التظاهر برفع الملف: ${file.name}`);
    }
  }
}

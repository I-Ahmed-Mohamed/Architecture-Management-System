import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  dataService = inject(DataService);

  backupData() {
    this.dataService.backupData();
  }

  deleteAllData() {
    this.dataService.deleteAllData();
  }
}

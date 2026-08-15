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

  formatDate(dateString: string | null): string {
    if (!dateString) return 'لم يتم بعد';
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  }

  formatAutoBackupDate(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleString('en-GB', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  }

  triggerFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const jsonStr = event.target.result;
        const success = await this.dataService.importData(jsonStr);
        if(success) alert('تم استيراد البيانات بنجاح!');
        else alert('حدث خطأ أثناء استيراد البيانات.');
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  downloadAutoBackup(backup: any) {
    const blob = new Blob([backup.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archfirm_autobackup_${backup.date.split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async restoreAutoBackup(backup: any) {
    if (confirm('هل أنت متأكد من رغبتك في استعادة هذه النسخة؟ سيتم استبدال البيانات الحالية.')) {
      const success = await this.dataService.importData(backup.data);
      if(success) alert('تم استعادة النسخة التلقائية بنجاح!');
    }
  }

  deleteAutoBackup(backupId: string) {
    if(confirm('هل تريد حذف هذه النسخة؟')) {
      const backups = this.dataService.autoBackups().filter(b => b.id !== backupId);
      this.dataService.autoBackups.set(backups);
      localStorage.setItem('archfirm_auto_backups', JSON.stringify(backups));
    }
  }

  backupData() {
    this.dataService.backupData();
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { Client, Project, Contract } from '../models';

export interface Task {
  id: number;
  title: string;
  project: string;
  status: string;
  date: string;
}

export interface Activity {
  id: string;
  title: string;
  date: Date;
  type: 'project' | 'contract' | 'task' | 'client' | 'general';
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Signals for state
  clients = signal<Client[]>([
    { id: '1', name: 'أحمد محمود', phone: '01001234567', email: 'ahmed@example.com', dateAdded: '1 أغسطس 2026' },
    { id: '2', name: 'شركة الأفق', phone: '01119876543', email: 'info@alofoq.com', dateAdded: '15 يوليو 2026' }
  ]);

  projects = signal<Project[]>([
    { id: '101', clientId: '1', clientName: 'أحمد محمود', name: 'فيلا سكنية - التجمع الخامس', phase: 'التصميم المعماري 2D', startDate: '10 أغسطس 2026', status: 'active' },
    { id: '102', clientId: '2', clientName: 'شركة الأفق', name: 'مقر إداري - العاصمة الجديدة', phase: 'الإشراف على التشطيب', startDate: '1 يوليو 2026', status: 'active' }
  ]);

  contracts = signal<Contract[]>([
    { id: 'CTR-1025', clientId: '1', clientName: 'أحمد محمود', date: '12 أغسطس 2026', value: 25000000, paid: 12000000, status: 'signed' },
    { id: 'CTR-1026', clientId: '2', clientName: 'شركة الأفق', date: '1 يوليو 2026', value: 8500000, paid: 4000000, status: 'active' }
  ]);

  tasks = signal<Task[]>([
    { id: 1, title: 'معاينة فيلا التجمع', project: 'فيلا سكنية - التجمع الخامس', status: 'todo', date: '15 أغسطس 2026' },
    { id: 2, title: 'تسليم مخططات 2D', project: 'مقر إداري - العاصمة الجديدة', status: 'in-progress', date: '16 أغسطس 2026' },
    { id: 3, title: 'الاجتماع مع العميل لاختيار الخامات', project: 'شقة سكنية - الشيخ زايد', status: 'todo', date: '18 أغسطس 2026' },
    { id: 4, title: 'اعتماد عقد التصميم', project: 'فيلا سكنية - التجمع الخامس', status: 'done', date: '12 أغسطس 2026' },
  ]);

  activities = signal<Activity[]>([
    { id: '1', title: 'تم توقيع عقد جديد مع أحمد محمود', date: new Date('2026-08-12T10:30:00'), type: 'contract' },
    { id: '2', title: 'تم البدء في مشروع فيلا سكنية - التجمع الخامس', date: new Date('2026-08-10T09:00:00'), type: 'project' },
  ]);

  // Computed values for dashboard
  activeProjectsCount = computed(() => this.projects().filter(p => p.status === 'active').length);
  totalClientsCount = computed(() => this.clients().length);
  draftContractsCount = computed(() => this.contracts().filter(c => c.status === 'draft').length);
  expectedRevenue = computed(() => this.contracts().reduce((sum, c) => sum + c.value, 0));
  collectedRevenue = computed(() => this.contracts().reduce((sum, c) => sum + c.paid, 0));

  constructor() { }

  logActivity(title: string, type: Activity['type'] = 'general') {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      date: new Date(),
      type
    };
    this.activities.update(acts => [newActivity, ...acts]);
  }

  addClient(client: Omit<Client, 'id' | 'dateAdded'>) {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toLocaleDateString('ar-EG')
    };
    this.clients.update(clients => [...clients, newClient]);
    this.logActivity(`تم إضافة عميل جديد: ${client.name}`, 'client');
  }

  addProject(project: Omit<Project, 'id' | 'startDate' | 'clientName'>) {
    const client = this.clients().find(c => c.id === project.clientId);
    const newProject: Project = {
      ...project,
      clientName: client ? client.name : 'غير معروف',
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toLocaleDateString('ar-EG')
    };
    this.projects.update(projects => [...projects, newProject]);
    this.logActivity(`تم إنشاء مشروع جديد: ${project.name}`, 'project');
  }

  addContract(contract: Omit<Contract, 'id' | 'date' | 'clientName' | 'paid'>) {
    const client = this.clients().find(c => c.id === contract.clientId);
    const newContract: Contract = {
      ...contract,
      clientName: client ? client.name : 'غير معروف',
      paid: 0,
      id: 'CTR-' + Math.floor(Math.random() * 9000 + 1000),
      date: new Date().toLocaleDateString('ar-EG')
    };
    this.contracts.update(contracts => [...contracts, newContract]);
    this.logActivity(`تم إنشاء عقد جديد للعميل: ${newContract.clientName}`, 'contract');
  }

  updateTaskStatus(taskId: number, newStatus: string) {
    this.tasks.update(tasks => tasks.map(t => {
      if (t.id === taskId) {
        this.logActivity(`تم تغيير حالة المهمة "${t.title}" إلى ${newStatus === 'done' ? 'مكتملة' : 'جاري العمل'}`, 'task');
        return { ...t, status: newStatus };
      }
      return t;
    }));
  }

  deleteAllData() {
    if (confirm('هل أنت متأكد من حذف جميع بيانات النظام؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      this.clients.set([]);
      this.projects.set([]);
      this.contracts.set([]);
      this.tasks.set([]);
      this.activities.set([]);
      this.logActivity('تم مسح جميع بيانات النظام!', 'general');
      alert('تم مسح البيانات بنجاح!');
    }
  }

  backupData() {
    const data = {
      clients: this.clients(),
      projects: this.projects(),
      contracts: this.contracts(),
      tasks: this.tasks(),
      activities: this.activities()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archfirm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.logActivity('تم تحميل نسخة احتياطية من البيانات', 'general');
  }
}

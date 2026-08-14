import { Injectable, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Client, Project, Contract } from '../models';

export interface Task {
  id: string;
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
  private firestore = inject(Firestore);

  // Firestore Collections mapped to Signals
  clients = toSignal(collectionData(collection(this.firestore, 'clients'), { idField: 'id' }), { initialValue: [
    { id: '1', name: 'أحمد محمود', phone: '01001234567', email: 'ahmed@example.com', dateAdded: '1 أغسطس 2026' },
    { id: '2', name: 'شركة الأفق', phone: '01119876543', email: 'info@alofoq.com', dateAdded: '15 يوليو 2026' }
  ] }) as any;

  projects = toSignal(collectionData(collection(this.firestore, 'projects'), { idField: 'id' }), { initialValue: [
    { id: '101', clientId: '1', clientName: 'أحمد محمود', name: 'فيلا سكنية - التجمع الخامس', phase: 'التصميم المعماري 2D', startDate: '10 أغسطس 2026', status: 'active' },
    { id: '102', clientId: '2', clientName: 'شركة الأفق', name: 'مقر إداري - العاصمة الجديدة', phase: 'الإشراف على التشطيب', startDate: '1 يوليو 2026', status: 'active' }
  ] }) as any;

  contracts = toSignal(collectionData(collection(this.firestore, 'contracts'), { idField: 'id' }), { initialValue: [
    { id: 'CTR-1025', clientId: '1', clientName: 'أحمد محمود', date: '12 أغسطس 2026', value: 25000000, paid: 12000000, status: 'signed' },
    { id: 'CTR-1026', clientId: '2', clientName: 'شركة الأفق', date: '1 يوليو 2026', value: 8500000, paid: 4000000, status: 'signed' }
  ] }) as any;

  tasks = toSignal(collectionData(collection(this.firestore, 'tasks'), { idField: 'id' }), { initialValue: [
    { id: '1', title: 'معاينة فيلا التجمع', project: 'فيلا سكنية - التجمع الخامس', status: 'todo', date: '15 أغسطس 2026' },
    { id: '2', title: 'تسليم مخططات 2D', project: 'مقر إداري - العاصمة الجديدة', status: 'in-progress', date: '16 أغسطس 2026' },
    { id: '3', title: 'الاجتماع مع العميل لاختيار الخامات', project: 'شقة سكنية - الشيخ زايد', status: 'todo', date: '18 أغسطس 2026' },
    { id: '4', title: 'اعتماد عقد التصميم', project: 'فيلا سكنية - التجمع الخامس', status: 'done', date: '12 أغسطس 2026' }
  ] }) as any;

  activities = toSignal(collectionData(collection(this.firestore, 'activities'), { idField: 'id' }), { initialValue: [
    { id: '1', title: 'تم توقيع عقد جديد مع أحمد محمود', date: new Date('2026-08-12T10:30:00'), type: 'contract' },
    { id: '2', title: 'تم البدء في مشروع فيلا سكنية - التجمع الخامس', date: new Date('2026-08-10T09:00:00'), type: 'project' }
  ] }) as any;

  // Computed values for dashboard
  activeProjectsCount = computed(() => this.projects().filter(p => p.status === 'active').length);
  totalClientsCount = computed(() => this.clients().length);
  draftContractsCount = computed(() => this.contracts().filter(c => c.status === 'draft').length);
  expectedRevenue = computed(() => this.contracts().reduce((sum, c) => sum + c.value, 0));
  collectedRevenue = computed(() => this.contracts().reduce((sum, c) => sum + c.paid, 0));

  constructor() { }

  logActivity(title: string, type: Activity['type'] = 'general') {
    addDoc(collection(this.firestore, 'activities'), {
      title,
      date: new Date().toISOString(),
      type
    });
  }

  addClient(client: Omit<Client, 'id' | 'dateAdded'>) {
    const newClient = {
      ...client,
      dateAdded: new Date().toLocaleDateString('ar-EG')
    };
    addDoc(collection(this.firestore, 'clients'), newClient);
    this.logActivity(`تم إضافة عميل جديد: ${client.name}`, 'client');
  }

  addProject(project: Omit<Project, 'id' | 'startDate' | 'clientName'>) {
    const clientsList = this.clients() as any[];
    const client = clientsList.find(c => c.id === project.clientId);
    const newProject = {
      ...project,
      clientName: client ? client.name : 'غير معروف',
      startDate: new Date().toLocaleDateString('ar-EG')
    };
    addDoc(collection(this.firestore, 'projects'), newProject);
    this.logActivity(`تم إنشاء مشروع جديد: ${project.name}`, 'project');
  }

  addContract(contract: Omit<Contract, 'id' | 'date' | 'clientName' | 'paid'>) {
    const clientsList = this.clients() as any[];
    const client = clientsList.find(c => c.id === contract.clientId);
    const newContract = {
      ...contract,
      clientName: client ? client.name : 'غير معروف',
      paid: 0,
      date: new Date().toLocaleDateString('ar-EG')
    };
    addDoc(collection(this.firestore, 'contracts'), newContract);
    this.logActivity(`تم إنشاء عقد جديد للعميل: ${newContract.clientName}`, 'contract');
  }

  updateTaskStatus(taskId: string, newStatus: string) {
    updateDoc(doc(this.firestore, 'tasks', taskId), { status: newStatus });
    this.logActivity(`تم تغيير حالة المهمة إلى ${newStatus === 'done' ? 'مكتملة' : 'جاري العمل'}`, 'task');
  }

  deleteAllData() {
    alert('خاصية الحذف معطلة حاليا لحماية قاعدة البيانات السحابية');
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

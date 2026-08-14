import { Injectable, signal, computed } from '@angular/core';
import { Client, Project, Contract } from '../models';

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
    { id: 'CTR-1025', clientId: '1', clientName: 'أحمد محمود', date: '12 أغسطس 2026', value: 50000, paid: 20000, status: 'signed' }
  ]);

  // Computed values for dashboard
  activeProjectsCount = computed(() => this.projects().filter(p => p.status === 'active').length);
  totalClientsCount = computed(() => this.clients().length);
  draftContractsCount = computed(() => this.contracts().filter(c => c.status === 'draft').length);
  expectedRevenue = computed(() => this.contracts().reduce((sum, c) => sum + c.value, 0));
  collectedRevenue = computed(() => this.contracts().reduce((sum, c) => sum + c.paid, 0));

  constructor() { }

  addClient(client: Omit<Client, 'id' | 'dateAdded'>) {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toLocaleDateString('ar-EG')
    };
    this.clients.update(clients => [...clients, newClient]);
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
  }
}

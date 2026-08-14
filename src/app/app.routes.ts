import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { TasksComponent } from './pages/tasks/tasks.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: '**', redirectTo: 'dashboard' }
];

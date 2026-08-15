import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { HrComponent } from './pages/hr/hr.component';
import { TreasuryComponent } from './pages/treasury/treasury.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailsComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'hr', component: HrComponent },
  { path: 'treasury', component: TreasuryComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' }
];

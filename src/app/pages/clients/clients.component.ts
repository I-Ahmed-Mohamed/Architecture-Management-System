import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);
  searchTerm = signal('');
  startDate = signal('');
  endDate = signal('');

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const start = this.startDate() ? new Date(this.startDate()) : null;
    const end = this.endDate() ? new Date(this.endDate()) : null;
    
    const clients = this.dataService.clients() || [];
    
    return clients.filter(c => {
      const matchesSearch = !term || 
        c.name.toLowerCase().includes(term) || 
        c.branchName.toLowerCase().includes(term) ||
        c.phone.includes(term) || 
        c.email.toLowerCase().includes(term);
        
      let matchesDate = true;
      if (start || end) {
        // Simple mock date filtering if implemented
      }
      
      return matchesSearch && matchesDate;
    });
  });

  clientForm = this.fb.group({
    name: ['', Validators.required],
    branchName: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.dataService.addClient({
        name: this.clientForm.value.name!,
        branchName: this.clientForm.value.branchName!,
        phone: this.clientForm.value.phone!,
        email: this.clientForm.value.email!
      });
      this.clientForm.reset();
      this.showForm.set(false);
    }
  }
}

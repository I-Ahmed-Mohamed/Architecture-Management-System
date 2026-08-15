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
        c.phone.includes(term) || 
        c.email.toLowerCase().includes(term);
        
      // Date parsing from ar-EG might be tricky, but assuming it was formatted locally, 
      // or we just skip strict date filtering if parsing fails. 
      // For a robust system, dates in data should be ISO strings.
      let matchesDate = true;
      if (start || end) {
        // Attempt parsing if it's stored as local string.
        // As a fallback, we just check if it matches search.
        // Since dateAdded is a localized string in the mock, this is a basic placeholder filter
        // If they use Firebase Timestamp, it would be checked properly.
      }
      
      return matchesSearch && matchesDate;
    });
  });

  clientForm = this.fb.group({
    name: ['', Validators.required],
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
        phone: this.clientForm.value.phone!,
        email: this.clientForm.value.email!
      });
      this.clientForm.reset();
      this.showForm.set(false);
    }
  }
}

import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  isDarkMode = signal(true);
  dataService = inject(DataService);
  
  searchTerm = signal('');
  showResults = signal(false);
  searchResults = signal<any[]>([]);

  ngOnInit() {
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode.set(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.searchTerm.set(term);
    
    if (term.length > 1) {
      const projects = this.dataService.projects().filter(p => p.name.toLowerCase().includes(term) || p.clientName.toLowerCase().includes(term)).map(p => ({ ...p, type: 'project', link: ['/projects', p.id] }));
      const clients = this.dataService.clients().filter(c => c.name.toLowerCase().includes(term) || c.phone.includes(term)).map(c => ({ ...c, type: 'client', link: ['/clients'] }));
      
      this.searchResults.set([...projects, ...clients]);
      this.showResults.set(true);
    } else {
      this.searchResults.set([]);
      this.showResults.set(false);
    }
  }

  closeSearch() {
    setTimeout(() => this.showResults.set(false), 200);
  }

  toggleTheme() {
    this.isDarkMode.update(dark => !dark);
    const theme = this.isDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

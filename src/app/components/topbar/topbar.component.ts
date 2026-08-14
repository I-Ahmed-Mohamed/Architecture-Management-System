import { Component, OnInit, signal, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  isDarkMode = signal(true);
  dataService = inject(DataService);
  location = inject(Location);
  router = inject(Router);
  
  searchTerm = signal('');
  showResults = signal(false);
  searchResults = signal<any[]>([]);
  showBackButton = signal(false);

  ngOnInit() {
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode.set(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Monitor routing for Back button
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide on dashboard
      this.showBackButton.set(event.urlAfterRedirects !== '/dashboard');
    });
  }

  goBack() {
    this.location.back();
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

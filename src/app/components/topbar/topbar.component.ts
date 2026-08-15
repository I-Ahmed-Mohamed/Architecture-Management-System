import { Component, OnInit, signal, inject, output } from '@angular/core';
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
  dataService = inject(DataService);
  location = inject(Location);
  router = inject(Router);

  openMenu = output<void>();
  isLightMode = signal(false);

  showBackButton = signal(false);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showBackButton.set(event.urlAfterRedirects !== '/dashboard');
    });

    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        this.isLightMode.set(true);
        document.body.classList.add('light-theme');
      }
    }
  }

  toggleTheme() {
    this.isLightMode.update(v => !v);
    if (this.isLightMode()) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }

  goBack() {
    this.location.back();
  }

  onMenuClick() {
    this.openMenu.emit();
  }


}

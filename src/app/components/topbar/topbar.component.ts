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

  showBackButton = signal(false);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showBackButton.set(event.urlAfterRedirects !== '/dashboard');
    });
  }

  goBack() {
    this.location.back();
  }

  onMenuClick() {
    this.openMenu.emit();
  }


}

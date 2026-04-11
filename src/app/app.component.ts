import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Web Code Studio Admin';
  showNavbarFlag = false;
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Mostrar navbar en home, gestion, suscripciones, ejercicios y perfil
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.showNavbarFlag = ['/home', '/gestion', '/suscripciones', '/ejercicios', '/perfil'].includes(url);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showNavbar(): boolean {
    return this.showNavbarFlag;
  }
}

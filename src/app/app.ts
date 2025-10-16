import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NetworkService } from './network.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('exp-tracker');
  isOnline = true;
  
  constructor(public router: Router, private networkService: NetworkService) {}
  
  ngOnInit() {
    this.networkService.networkStatus$.subscribe(status => {
      this.isOnline = status;
    });
  }
  
  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-desktop-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule],
  templateUrl: './desktop-nav.component.html',
  styleUrl: './desktop-nav.component.scss'
})
export class DesktopNavComponent {
  @Input() links: any[] = [];
  @Input() selectedIndex: number = 0;
}

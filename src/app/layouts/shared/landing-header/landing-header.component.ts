import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-header',
  templateUrl: './landing-header.component.html',
  styleUrls: ['./landing-header.component.scss']
})
export class LandingHeaderComponent {
  isMenuCollapsed = true;

  scrollToSection(elementId: string): void {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features = [
    {
      icon: 'fas fa-tachometer-alt',
      title: 'home.features.realTimeMonitoring',
      description: 'home.features.realTimeMonitoringDesc',
      animation: 'fade-up'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'home.features.usageAnalytics',
      description: 'home.features.usageAnalyticsDesc',
      animation: 'fade-up'
    },
    {
      icon: 'fas fa-bell',
      title: 'home.features.smartNotifications',
      description: 'home.features.smartNotificationsDesc',
      animation: 'fade-up'
    },
    {
      icon: 'fas fa-credit-card',
      title: 'home.features.easyPayments',
      description: 'home.features.easyPaymentsDesc',
      animation: 'fade-up'
    }
  ];

  stats = [
    { value: '50K+', label: 'Active Users', animation: 'fade-right' },
    { value: '99.9%', label: 'Uptime', animation: 'fade-up' },
    { value: '24/7', label: 'Support', animation: 'fade-left' }
  ];


  
  scrollToSection(elementId: string): void {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}

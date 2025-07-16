import { Component, OnInit } from '@angular/core';
import { FAQ } from '@model/models/faq.model';
import { ProfileService } from '@service/profile.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  faqs: FAQ[] = [];
  callCenterNumber = '+1234567890'; // Replace with actual number
  supportEmail = 'support@example.com'; // Replace with actual email
  activeFaqId: number | null = null;

  constructor(
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadFAQs();
  }

  loadFAQs() {
    this.profileService.getFaqs().subscribe({
      next: (data) => {
        this.faqs = data.data;
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
      }
    });
  }

  openPhoneDialer() {
    window.location.href = `tel:${this.callCenterNumber}`;
  }

  openEmailClient() {
    window.location.href = `mailto:${this.supportEmail}`;
  }

  toggleFaq(id: number) {
    this.activeFaqId = this.activeFaqId === id ? null : id;
  }
}

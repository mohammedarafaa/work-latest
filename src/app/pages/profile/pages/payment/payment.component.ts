import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@service/shared/alert.service';
import { ProfileService } from '@service/profile.service';
import { PaymentService } from '@service/payment.service';
import { MeterTransaction, MeterTransactionDTo } from '@model/meterTransaction.model';
import { getCurrentStatus } from '@model/Utils/Status';
import { paging_$Searching } from '@model/Utils/Pagination';
import { SavedCard } from 'src/app/models/profile.model';


interface BillingHistory {
  id: string;
  description: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending';
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  savedCards: SavedCard[] = [];
 meterTransactionHistory!: MeterTransaction[];
  isLoading: boolean = true;

  constructor(
    private profileService: ProfileService,
    private paymentService: PaymentService,
    private alertService: AlertService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPaymentData();
  }

  loadPaymentData(): void {
    this.isLoading = true;
    // Load saved cards
    this.profileService.getSavedCards().subscribe({
      next: (response) => {
        this.savedCards = response.data;
      },
      error: (error) => {
        this.alertService.ErrorNotification(this.translate.instant('Error_Loading_Cards'));
      }
    });

    // Load billing history
    this.profileService
      .getTransactionHistory(new paging_$Searching(), null)
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            const result = response.data?.content!;
            this.meterTransactionHistory = result.slice(0, 4);
          } else {
            this.meterTransactionHistory = [];
          }
        },
        error: (error: any) => {
          this.alertService.ErrorNotification(
            this.translate.instant("Error_Loading_Transaction")
          );
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    
  }

  getCardIcon(cardType: string): string {
    // <i class="fa-brands fa-cc-mastercard"></i>
    const icons: { [key: string]: string } = {
      VISA: 'fa-brands fa-cc-visa text-primary',
      MASTER: 'fa-brands fa-cc-mastercard text-primary',
      default: 'bi-credit-card-2-front-fill text-secondary'
    };
    return icons[cardType.toUpperCase()] || icons['default'];
  }

  openAddPaymentModal(): void {
    // TODO: Implement modal for adding new card
    // This should open a modal with a form to add new card details
  }
  getCurrentStatus(status:string){
    return getCurrentStatus(status, 'TRANSACTION_STATUS');
}
  deleteCard(cardId: number): void {
    if (confirm(this.translate.instant('Confirm_Delete_Card'))) {
      // this.profileService.deleteCard(cardId).subscribe({
      //   next: (response) => {
      //     this.alertService.SuccessNotification(this.translate.instant('Card_Deleted_Successfully'));
      //     this.loadPaymentData();
      //   },
      //   error: (error) => {
      //     this.alertService.ErrorNotification(this.translate.instant('Error_Deleting_Card'));
      //   }
      // });
    }
  }

  setDefaultCard(cardId: number): void {
    // this.profileService.setDefaultCard(cardId).subscribe({
    //   next: (response) => {
    //     this.alertService.SuccessNotification(this.translate.instant('Default_Card_Updated'));
    //     this.loadPaymentData();
    //   },
    //   error: (error) => {
    //     this.alertService.ErrorNotification(this.translate.instant('Error_Updating_Default_Card'));
    //   }
    // });
  }
}

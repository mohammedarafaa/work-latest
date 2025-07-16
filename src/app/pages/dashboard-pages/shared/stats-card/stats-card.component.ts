import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from '@service/services/dashboard.service';
import { NotificationService } from '@service/shared/notifcation.service';
@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  meterSummery: any = {
    total: 0,
    GAS: 0,
    ELECTRICITY: 0,
    WATER: 0
  };
  isLoading: boolean = false;


  ngOnInit(): void {
    this.getMeterSummry();
  }
  constructor(
    private translate: TranslateService,
    private router: Router,
    private notificationService: NotificationService,
    private dashboardService: DashboardService) {
  
  }

  getMeterSummry() {
    this.isLoading = true;
    this.dashboardService.getAllMeterSummery().subscribe({
        next: (value: any) => {
          if (value.status == 200) {
            this.meterSummery = value.data;
          } else  {
            this.notificationService.WaringNotification('get_meter_summery_error');
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            'get_meter_summery_error'
          );
  
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false),
      });
  }

  navigateToMeterList(type: string) {
    this.router.navigate(['/Meters_Summary', type]);
  }
}

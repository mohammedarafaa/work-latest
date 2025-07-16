import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MeterSummery } from '@model/meter.model';

@Component({
  selector: 'app-meter-card',
  templateUrl: './meter-card.component.html',
  styleUrls: ['./meter-card.component.scss']
})
export class MeterCardComponent {

  @Input() currentMeter!: MeterSummery;
  constructor(private router: Router) {}

  getIcons(type: string): string {
    if (type === 'ELECTRICITY') return 'fa fa-bolt';
    else if (type === 'GAS') return 'fas fa-fire';
    else if (type === 'WATER') return 'fas fa-tint';
    else return '';
  }

  viewMeterHistory(meter: MeterSummery) {
    this.router.navigate(
      ['/Consumption_History', meter.meterId, 'consumption'],
      {
        queryParams: { months: 3 },
      }
    );
  }
}

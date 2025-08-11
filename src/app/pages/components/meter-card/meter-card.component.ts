import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { MeterSummery } from "@model/meter.model";

@Component({
  selector: "app-meter-card",
  templateUrl: "./meter-card.component.html",
  styleUrls: ["./meter-card.component.scss"],
})
export class MeterCardComponent {
  @Input() currentMeter!: MeterSummery;
  @Input() isViewBalanceLoading = false; // Add loading state input
  @Output() viewBalanceClick = new EventEmitter<MeterSummery>(); // Add event emitter

  constructor(private router: Router) {}

  getIcons(type: string): string {
    if (type === "ELECTRICITY") return "fa fa-bolt";
    else if (type === "GAS") return "fas fa-fire";
    else if (type === "WATER") return "fas fa-tint";
    else return "";
  }
  getProgressWidth(balance: number): number {
    const maxBalance = 4000; // Adjust based on your requirements
    return Math.min((balance / maxBalance) * 100, 100);
  }
  getUnitOfMeasure(type: string): string {
    switch (type) {
      case "WATER":
        return "m³";
      case "ELECTRICITY":
        return "kWh";
      case "GAS":
        return "m³";
      default:
        return "";
    }
  }

  onCharge(meter: any) {
    this.router.navigate(["/Charging"], {
      queryParams: {
        meterId: meter.meterId,
        meterSerial: meter.meterSerial,
        meterType: meter.type,
        autoFocus: "true",
      },
    });
  }

  // Add the view balance click handler
  onViewBalance(meter: MeterSummery) {
    this.viewBalanceClick.emit(meter);
  }
}

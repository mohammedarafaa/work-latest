import { Injectable } from "@angular/core";

export interface ChargeScheme {
  chargeAmount: number;
  fixedFee: number;
  varFee: number;
  totalPay: number;
}

@Injectable({
  providedIn: "root",
})
export class ChargeCalculationService {
  private chargeConfig = {
    fixedFee: 4,
    varFeePercentage: 2.5, // 2.5% variable fee (0.025 as percentage)
  };

  constructor() {}

  // Calculate total from charge amount (existing functionality)
  calculateTotalFromCharge(chargeAmount: number): ChargeScheme {
    const fixedFee = this.chargeConfig.fixedFee;
    const varFee = (chargeAmount * this.chargeConfig.varFeePercentage) / 100;
    const totalPay = chargeAmount + fixedFee + varFee;

    return {
      chargeAmount,
      fixedFee,
      varFee: Math.round(varFee),
      totalPay: Math.round(totalPay),
    };
  }

  // Calculate charge amount from total (new functionality)
  calculateChargeFromTotal(totalAmount: number): ChargeScheme {
    const fixedFee = this.chargeConfig.fixedFee;

    // Formula: totalAmount = chargeAmount + fixedFee + (chargeAmount * varFeePercentage / 100)
    // Solving for chargeAmount: chargeAmount = (totalAmount - fixedFee) / (1 + varFeePercentage / 100)
    const chargeAmount =
      (totalAmount - fixedFee) / (1 + this.chargeConfig.varFeePercentage / 100);
    const varFee = (chargeAmount * this.chargeConfig.varFeePercentage) / 100;

    return {
      chargeAmount: Math.round(chargeAmount),
      fixedFee,
      varFee: Math.round(varFee),
      totalPay: totalAmount,
    };
  }

  // Backward compatibility
  calculateTotalPayment(chargeAmount: number): ChargeScheme {
    return this.calculateTotalFromCharge(chargeAmount);
  }

  loadChargeConfig(): Promise<any> {
    return Promise.resolve(this.chargeConfig);
  }
}

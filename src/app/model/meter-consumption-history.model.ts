// meter-consumption-history.model.ts
/** Single daily record */
export interface DailyRecord {
  date: string;            // e.g. "2025-04-11"
  meterReading: number;    // reading value
  availableCredit: number; // credit value
}

/** Daily consumption data for one meter */
export interface MeterDailyConsumption {
  meterId: number;
  meterSerial: string;
  type: 'GAS' | 'WATER' | 'ELECTRICITY';
  propertyNo: string;
  block: string;
  availableCredit: number | null;
  consumption: number | null;
  dailyRecords: DailyRecord[];
}

/** API response wrapper for daily consumption */
export interface MeterDailyConsumptionDTO {
  status: number;
  message: string;
  data: MeterDailyConsumption[];
  errors?: any;
}

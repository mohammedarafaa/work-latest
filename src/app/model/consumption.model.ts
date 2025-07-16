import { Meter } from "./meter.model";

export interface Consumption {
  id: number;
  meterId: number;
  Meter: Meter;
  meterType: string;
  address: string;
  projectId: string;
  unitId: string;
  cost: number;
  customerId: number;
  Consumption: number;
  date: string;
}

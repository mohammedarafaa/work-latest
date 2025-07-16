import { Meter } from './meter.model';
import { PagingDto } from './Utils/PagingDto';
export interface Charge {
  id: number;
  meterId: number;
  Meter: Meter;
  meterType: string;
  status: string;
  balance: number;
  customerId: number;
  propertyId: number;
  active: boolean;
}
export interface ChargeDTo {
  id: number;
  content: Charge[];
  pageable: PagingDto;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
}

import { PagingDto } from './Utils/PagingDto';
export interface Meter {
  id: number;
  serial: string;
  sim: string
  modemId: number;
  modem: string;
  modemSerial: string;
  ip: string;
  port: string;
  type: string;
  status: string;
  balance: number;
  customerId: number;
  propertyId: number;
  warehouseId: number;
  warehouseName: string;
  modelId: string;
  firmwareName: string;
  firmwareId: number;
  erpCode: string;
  firmwareUpdated: boolean;
  simId: number;
  simNumber: string;
  active: boolean;
}
export interface MeterDTo {
  id: number;
  content: Meter[];
  pageable: PagingDto;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
}
export interface MeterSummery {
  meterId: number;
  meterSerial: string;
  type: string;
  propertyNo: string;
  block: string;
  availableCredit: number;
  consumption: number;
  meterReading:number
}
export interface MeterSummeryDTo {
  content: MeterSummery[];
  pageable: PagingDto;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
}
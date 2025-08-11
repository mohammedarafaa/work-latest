import { PagingDto } from "./Utils/PagingDto"


export interface MeterTransaction {
  id: number
  transactionNumber: string
  amount: number
  amountCharged: number
  status: string
  paymentMethodType: string
  createdAt: string
  updatedAt: string
  propertyId: number
  propertyNo: string
  compoundName: string
  meterId: number
  meterSerial: string
  meterType: string
}

export interface MeterTransactionDTo{
	id: number,
  content: MeterTransaction[],
  pageable: PagingDto,
  totalPages: number,
  totalElements: number,
  numberOfElements: number
}
export interface MeterTransactionFilter {
  propertyId?: number;
  meterId?: number;
  meterType?: "GAS" | "WATER" | "ELECTRICITY";
  compoundId?: number;
  startDate?: string;
  endDate?: string;
}

export interface FilterOption {
  id: number;
  name: string;
  value?: any;
}

export interface MeterOption {
  id: number;
  serialNumber: string;
  meterType: string;
  propertyId?: number;
  compoundId?: number;
}

import { Property } from "../models/property.model"
import { Customer } from "./customer"
import { PagingDto } from "./Utils/PagingDto"


export interface MeterPaymentTransaction {
  serial: string
  port: any
  type: string
  customer: Customer
  property: Property
  model: string
  erpCode: string
  code: number
}

export interface MeterPaymentTransactionDTo{
	id: number,
  content: MeterPaymentTransaction[],
  pageable: PagingDto,
  totalPages: number,
  totalElements: number,
  numberOfElements: number
}

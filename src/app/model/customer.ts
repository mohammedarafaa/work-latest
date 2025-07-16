import { PagingDto } from "./Utils/PagingDto"

export interface Customer{
  id: number
  email: string
  fullName: string
  username: string
  phoneNumber: string
  password: string
  contact: string
  accountType: any
  gender: string
  nationalId: string
  nationalIdAddress: string
  job: string
  erpCode: string
  minChargeLimit: any
  maxChargeLimit: any
  active: boolean
  registrationDate: any
  code: number
}
export interface CustomerDTo {
  id: number;
  content: Customer[];
  pageable: PagingDto;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
}
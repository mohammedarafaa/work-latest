export interface Meter {
  serial: string;
  port: number;
  type: 'GAS' | 'WATER' | 'ELCTRICTY';
  customer: Customer;
  property: Property;
  model: string;
  erpCode: string;
  code: number;
}

export interface Customer {
  email: string;
  fullName: string;
  phoneNumber: string;
  contact: string;
  gender: 'MALE' | 'FEMALE';
  nationalId: string;
  nationalIdAddress: string;
  job: string;
  erpCode: string;
  code: number;
}

export interface Property {
  number: string;
  propertyNo: string;
  address: Address;
  activity: Activity;
  project: Project;
  customer: Customer;
  code: number;
}

export interface Address {
  street: string;
  buildingNumber: string;
  additionalInfo: string;
  block: string;
  floor: string;
}

export interface Activity {
  nameAr: string;
  name: string;
  code: number;
}

export interface Project {
  name: string;
  address: string;
  image: string;
  area: Area;
  zone: string;
  code: number;
}

export interface Area {
  nameAr: string;
  name: string;
  code: number;
} 
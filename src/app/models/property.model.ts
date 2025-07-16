import { Customer } from "@model/customer";
import { Project } from "@model/project.model";

export interface Property {
  number: string;
  propertyNo: string;
  address: Address;
  activity: Activity;
  project: Project | null;
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


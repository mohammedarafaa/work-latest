import { PagingDto } from "./Utils/PagingDto"


export interface Project {
  id: number
  name: string
  address: string
  warehouseId: number
  image: string
  imagePath: string
  developerName: string
  developerId: number
  countryName: string
  countryId: number
  cityName: string
  cityId: number
  areaName: string
  areaId: number
  no_Meter: number
  no_Devices: number
  createdAt: string
  createdBy: string
  editBy: string
  editAt: string
  erpCode: string
  zone: any //check later
}
export interface ProjectDTo{
	id: number,
  content: Project[],
  pageable: PagingDto,
  totalPages: number,
  totalElements: number,
  numberOfElements: number
}

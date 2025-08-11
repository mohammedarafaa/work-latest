import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { HttpService } from "./http.service";
import { CustomerService } from "@service/customer.service";
import { ProjectService } from "@service/project.service";
import { PropertyService } from "@service/property.service";

@Injectable({
  providedIn: "root",
})
export class SharedService {
  allowedImagesTypes = ["image/jpeg", "image/png"];
  constructor(
    private http: HttpService,
    private propertyService: PropertyService,
    private customerService: CustomerService,
    private projectService: ProjectService
  ) {}

  getAllProperty() {
    return this.propertyService.getAllProperties();
  }
  getAllPropertyByCompoundId(compoundId: string) {
    return this.propertyService.getAllPropertiesByCompoundId(compoundId);
  }
  getAllProject() {
    return this.projectService.getAllProjects();
  }
  getAllCustomer() {
    return this.customerService.getAllRecordsList();
  }
  /**
   * Ending Enum
   */
  isNotEmpty<T>(value: T): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    if (typeof value === "string" && value.trim() === "") {
      return false;
    }

    return true;
  }
  ignoreProperty = ["cityId", "deleted"];
  getObjectProperties(obj: any): { [key: string]: boolean } {
    return Object.keys(obj)
      .filter((key) => !this.ignoreProperty.includes(key))
      .reduce((acc: { [key: string]: boolean }, key: string) => {
        acc[key] = false;
        return acc;
      }, {});
  }
}

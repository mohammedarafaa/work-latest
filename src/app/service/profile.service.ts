import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  NotificationPreference,
  SavedCard,
  PersonalInfo,
  EditProfileRequest,
  ChangePasswordRequest,
  AddCardRequest,
} from "../models/profile.model";
import { ApiResponse } from "@model/auth/auth.model";
import { MeterTransactionDTo } from "@model/meterTransaction.model";
import { paging_$Searching } from "@model/Utils/Pagination";

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

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private userSubject: BehaviorSubject<PersonalInfo> =
    new BehaviorSubject<PersonalInfo>({} as PersonalInfo);

  constructor(private http: HttpClient) {}

  public get userValue() {
    return this.userSubject.value;
  }

  public set user(profile: PersonalInfo) {
    this.userSubject.next(profile);
  }

  getNotificationPreferences(): Observable<
    ApiResponse<NotificationPreference>
  > {
    return this.http.get<ApiResponse<NotificationPreference>>(
      `${this.apiUrl}/preferences/notificationPreferences`
    );
  }

  updateNotificationPreferences(
    preferences: NotificationPreference
  ): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/preferences/notificationPreferences`,
      preferences
    );
  }

  getSavedCards(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payment/saved-cards`);
  }

  addCard(card: AddCardRequest): Observable<SavedCard> {
    return this.http.post<SavedCard>(`${this.apiUrl}/payment/add-card`, card);
  }

  deleteCard(cardId: number): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/payment/delete-card/${cardId}`
    );
  }

  getPersonalInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/personalInfo`);
  }

  editProfile(profile: EditProfileRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/editProfile`, profile);
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/changePassword`, request);
  }

  updatePassword(token: string, newPassword: string): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/updatePassword?token=${token}`,
      newPassword
    );
  }

  resetPassword(email: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/resetPassword`, { email });
  }

  // getTransactionHistory(
  //   paging: paging_$Searching,
  //   filters?: MeterTransactionFilter | null
  // ): Observable<ApiResponse<MeterTransactionDTo>> {
  //   const params = this.buildFilterParams(paging, filters);
  //   return this.http.get<ApiResponse<MeterTransactionDTo>>(
  //     `${environment.apiUrl}/meter-transactions/customer?${params.toString()}`
  //   );
  // }
  getAllCustomersCount(): Observable<number> {
    return this.http.get<number>(
      `${environment._apiUrl}/public/getPublicCustomerCount`
    );
  }

  getTransactionHistoryByCustomerId(
    customerId: number,
    paging: paging_$Searching,
    filters?: MeterTransactionFilter | null
  ): Observable<ApiResponse<MeterTransactionDTo>> {
    const params = this.buildFilterParams(paging, filters);
    return this.http.get<ApiResponse<MeterTransactionDTo>>(
      `${
        environment.apiUrl
      }/meter-transactions/customer/${customerId}?${params.toString()}`
    );
  }

  getCompounds(paging?: paging_$Searching): Observable<ApiResponse<any>> {
    let params = new URLSearchParams();

    if (paging) {
      params = this.addPaginationParams(params, paging);
    }

    return this.http.get<ApiResponse<any>>(
      `${environment.apiUrl}/compounds?${params.toString()}`
    );
  }

  getProperties(
    compoundId?: number,
    paging?: paging_$Searching
  ): Observable<ApiResponse<any>> {
    let params = new URLSearchParams();

    if (compoundId) {
      params.append("compoundId", compoundId.toString());
    }

    if (paging) {
      params = this.addPaginationParams(params, paging);
    }

    return this.http.get<ApiResponse<any>>(
      `${environment.apiUrl}/properties?${params.toString()}`
    );
  }

  getMeters(
    compoundId?: number,
    propertyId?: number,
    meterType?: string,
    paging?: paging_$Searching
  ): Observable<ApiResponse<any>> {
    let params = new URLSearchParams();

    if (compoundId) params.append("compoundId", compoundId.toString());
    if (propertyId) params.append("propertyId", propertyId.toString());
    if (meterType) params.append("meterType", meterType);

    if (paging) {
      params = this.addPaginationParams(params, paging);
    }

    return this.http.get<ApiResponse<any>>(
      `${environment.apiUrl}/meters?${params.toString()}`
    );
  }

  getFilteredMeters(
    compoundId?: number,
    propertyId?: number,
    meterType?: string,
    paging?: paging_$Searching
  ): Observable<ApiResponse<any>> {
    let params = new URLSearchParams();

    if (compoundId) params.append("compoundId", compoundId.toString());
    if (propertyId) params.append("propertyId", propertyId.toString());
    if (meterType) params.append("meterType", meterType);

    if (paging) {
      params = this.addPaginationParams(params, paging);
    }

    console.log(
      "Filtered meters API call:",
      `${
        environment.apiUrl
      }/meter-transactions/filtered_meters?${params.toString()}`
    );

    return this.http.get<ApiResponse<any>>(
      `${
        environment.apiUrl
      }/meter-transactions/filtered_meters?${params.toString()}`
    );
  }

  getFaqs(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/support/faqs`);
  }

  private buildFilterParams(
    paging: paging_$Searching,
    filters?: MeterTransactionFilter | null
  ): URLSearchParams {
    let params = new URLSearchParams();

    params = this.addPaginationParams(params, paging);

    if (filters) {
      this.addFilterParams(params, filters);
    }

    return params;
  }

  private addPaginationParams(
    params: URLSearchParams,
    paging: paging_$Searching
  ): URLSearchParams {
    params.append("page", (paging.page - 1).toString());
    params.append("size", paging.size.toString());

    if (paging.sort && paging.sortDirection) {
      params.append("sort", `${paging.sort},${paging.sortDirection}`);
    }

    return params;
  }

  private addFilterParams(
    params: URLSearchParams,
    filters: MeterTransactionFilter
  ): void {
    if (filters.propertyId) {
      params.append("propertyId", filters.propertyId.toString());
    }
    if (filters.meterId) {
      params.append("meterId", filters.meterId.toString());
    }
    if (filters.meterType) {
      params.append("meterType", filters.meterType);
    }
    if (filters.compoundId) {
      params.append("compoundId", filters.compoundId.toString());
    }
    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }
  }
  // In ProfileService, add this method:
  updateThemePreference(themeData: {
    appearanceMode: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/preferences/notificationPreferences`,
      themeData
    );
  }

  getTransactionHistory(
    paging: paging_$Searching,
    filters?: MeterTransactionFilter | null
  ): Observable<ApiResponse<MeterTransactionDTo>> {
    const params = new URLSearchParams();

    params.append("page", paging.page.toString());
    params.append("size", paging.size.toString());

    if (filters) {
      this.addFilterParams(params, filters);
    }

    const url = `${
      environment.apiUrl
    }/meter-transactions/customer?${params.toString()}`;

    return this.http.get<ApiResponse<MeterTransactionDTo>>(url);
  }
}

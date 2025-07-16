import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  NotificationPreference,
  SavedCard,
  PersonalInfo,
  EditProfileRequest,
  ChangePasswordRequest,
  AddCardRequest
} from '../models/profile.model';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterTransactionDTo } from '@model/meterTransaction.model';
import { paging_$Searching } from '@model/Utils/Pagination';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  // private userSubject!: BehaviorSubject<PersonalInfo>;
  private userSubject: BehaviorSubject<PersonalInfo> =new BehaviorSubject<PersonalInfo>({} as PersonalInfo);;

  constructor(private http: HttpClient) { }

  public get userValue() {
    return this.userSubject.value;
  }
  public set user(profile: PersonalInfo) {
    this.userSubject.next(profile);

  }
  getNotificationPreferences(): Observable<ApiResponse<NotificationPreference>> {
    return this.http.get<ApiResponse<NotificationPreference>>(`${this.apiUrl}/preferences/notificationPreferences`);
  }

  updateNotificationPreferences(preferences: NotificationPreference): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/preferences/notificationPreferences`, preferences);
  }

  getSavedCards(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payment/saved-cards`);
  }

  addCard(card: AddCardRequest): Observable<SavedCard> {
    return this.http.post<SavedCard>(`${this.apiUrl}/payment/add-card`, card);
  }

  deleteCard(cardId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/payment/delete-card/${cardId}`);
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
    return this.http.post<string>(`${this.apiUrl}/updatePassword?token=${token}`, newPassword);
  }

  resetPassword(email: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/resetPassword`, { email });
  }
  getTransactionHistory(paging: paging_$Searching, params: URLSearchParams): Observable<ApiResponse<MeterTransactionDTo>> {
    return this.http.get<ApiResponse<MeterTransactionDTo>>(`${environment.apiUrl}/meter-transactions/customer?page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`);
  }
  getTransactionHistoryBtCustomerId(customerId:number , paging: paging_$Searching, params: URLSearchParams): Observable<ApiResponse<MeterTransactionDTo>> {
    // return this.http.get<ApiResponse<MeterTransactionDTo>>(`${environment.apiUrl}/meter-transactions/customer/${customerId}/?page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`);
    return this.http.get<ApiResponse<MeterTransactionDTo>>(`${environment.apiUrl}/meter-transactions/customer/${customerId}/?page=${paging.page - 1}&size=${paging.size}`);
  }
  getFaqs(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/support/faqs`);
  }
}

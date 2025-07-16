
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

import { paging_$Searching } from '@model/Utils/Pagination';
import { HttpService } from '@service/shared/http.service';
import { Customer, CustomerDTo } from '@model/customer';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterTransactionDTo } from '@model/meterTransaction.model';



@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(public http: HttpService) { }
  getRecordByPaging$Searching(paging: paging_$Searching, params: URLSearchParams): Observable<ApiResponse<CustomerDTo>> {
    return this.http._getCall<ApiResponse<CustomerDTo>>(
      `${environment._apiUrl}/customers/page?page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`
    );
  }

  getAllRecords(): Observable<any> {
    return this.http._getCall<any>(`${environment._apiUrl}/customers`);
  }
  getAllRecordsList(): Observable<any> {
    return this.http._getCall<any>(`${environment._apiUrl}/customers/list`);
  }
  getOneRecordById(id: any): Observable<Customer> {
    return this.http._getCall<Customer>(`${environment._apiUrl}/customers/${id}`);
  }
  addRecord(record: Customer): Observable<any> {
    return this.http._postCall<any>(
      `${environment._apiUrl}/customers`,
      record,
      false
    );
  }

  editRecord(record: Customer): Observable<any> {
    return this.http._putCall<any>(
      `${environment._apiUrl}/customers/${record.id}`,
      record,
      false
    );
  }
  deleteRecord(id: number) {
    return this.http._deleteCall<any>(
      `${environment._apiUrl}/customers/${id}`,
    );
  }
  getMeterProfileByCustomerId(id: any): Observable<any> {
    return this.http._getCall<any>(`${environment._apiUrl}/meters/profile/by-customer/${id}`);
  }
  getMeterTransactionByCustomer(paging: paging_$Searching, params: URLSearchParams): Observable<ApiResponse<MeterTransactionDTo>> {
    return this.http._getCall<ApiResponse<MeterTransactionDTo>>(`${environment.apiUrl}/meter-transactions/customer?page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`);
  }
// By Admin and customer Service

  ResetPassword(id: number, newPassword:any) {
    return this.http._postCall<any>(
      `${environment.apiUrl}/customer-service/${id}/reset-password`,newPassword
    );
  }
  deActiveAccount(id: number) {
    return this.http._postCall<any>(
      `${environment.apiUrl}/customer-service/${id}/deactivate`,null
    );
  }
  ActiveAccount(id: number) {
    return this.http._postCall<any>(
      `${environment.apiUrl}/customer-service/${id}/activate`,null
    );
  }
  chargingLimit(id: number, charingLimit:any) {
    return this.http._postCall<any>(
      `${environment.apiUrl}/customer-service/${id}/charging-limits`,charingLimit
    );
  }
  getProfileId(id: any): Observable<Customer> {
    return this.http._getCall<Customer>(`${environment.apiUrl}/customer-service/${id}/profile`);
  }
  getMeterById(customerId: any): Observable<Customer> {
    return this.http._getCall<Customer>(`${environment.apiUrl}/customer-service/${customerId}/meters`);
  }
  
}

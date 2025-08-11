import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '@model/auth/auth.model';
import { DataTableResponse, paging_$Searching } from '@model/Utils/Pagination';
import { MeterSummery, MeterSummeryDTo } from '@model/meter.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/home`;

  constructor(private http: HttpClient) { }


  getAllMeterSummery(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/meters-summary`);
  }

  getAllMeterByType(type: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/meters-summary/${type}`);
  }
  getAllMeterByTypePaging(type: string , paging: paging_$Searching, params: URLSearchParams): Observable<ApiResponse<MeterSummeryDTo>> {
    return this.http.get<ApiResponse<MeterSummeryDTo>>(`${this.apiUrl}/meters-summary/${type}?page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`);
  }
   getAllMeterFilter(paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/meter-profile?page=${paging.page - 1}&size=${paging.size}${params ? '&' + params?.toString() : ''}`);
    // return this.http.get<any>(`${environment.apiUrl}/meter-profile?page=0&size=10&meterType=WATER`);
    // http://localhost:8080/api/meter-profile?page=0&size=10&meterType=ELECTRICITY
  }
   getAllMeterMix_Min(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/profile/min-max-limits`);
    // /api/profile/min-max-limits
  }
  getAllMeterList(): Observable<DataTableResponse<any>> {
    return this.http.get<any>(`${environment.apiUrl}/meter-profile/list`);
  }

   getAllMeterFilterByCustomer(paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/meter-transactions/filtered_meters?page=${paging.page - 1}&size=${paging.size}${paging.sortDirection}${params ? '&' + params?.toString() : ''}`);
    // /api/meter-transactions/filtered_meters
  }
  // `${environment.apiUrl}/customers?search=${paging.search}&page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`


}

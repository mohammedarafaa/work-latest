import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { ApiResponse } from "@model/auth/auth.model";
import { MeterTransactionDTo } from "@model/meterTransaction.model";
import { FAQDTo, FAQ } from "@model/models/faq.model";
import { paging_$Searching } from "@model/Utils/Pagination";
import { Observable } from "rxjs";
import { HttpService } from "./shared/http.service";


@Injectable({
    providedIn: 'root',
  })
  export class FAQService {
    constructor(public http: HttpService) { }
    getRecordByPaging$Searching(paging: paging_$Searching, params: URLSearchParams): Observable<ApiResponse<FAQDTo>> {
      return this.http._getCall<ApiResponse<FAQDTo>>(
        `${environment.apiUrl}/faqs?page=${paging.page - 1}&size=${paging.size}&sort=${paging.sort},${paging.sortDirection}${params ? '&' + params?.toString() : ''}`
      );
    }
  
    getAllRecords(): Observable<any> {
      return this.http._getCall<any>(`${environment.apiUrl}/faqs`);
    }
    getAllRecordsList(): Observable<any> {
      return this.http._getCall<any>(`${environment.apiUrl}/faqs/list`);
    }
    getOneRecordById(id: any): Observable<any> {
      return this.http._getCall<any>(`${environment.apiUrl}/faqs/${id}`);
    }
    addRecord(record: FAQ): Observable<any> {
      return this.http._postCall<any>(
        `${environment.apiUrl}/faqs`,
        record,
        false
      );
    }
  
    editRecord(record: FAQ): Observable<any> {
      return this.http._putCall<any>(
        `${environment.apiUrl}/faqs/${record.id}`,
        record,
        false
      );
    }
    deleteRecord(id: number) {
      return this.http._deleteCall<any>(
        `${environment.apiUrl}/faqs/${id}`,
      );
    }
 
  }
  
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpService } from '@service/shared/http.service';
import { TransactionDTO } from '@models/transaction.dto';
import { paging_$Searching } from '@models/Utils/Pagination';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(public http: HttpService) {}

  getTransactionsByPaging(isEnglish: boolean = true, paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http._getCall<TransactionDTO>(
      `${environment.apiUrl}/transactions/filter?`+ (paging.name ? `${isEnglish ? 'name' : 'nameAr'}=${paging.name}&` : '') +
      `page=${paging.page - 1}&size=${paging.size}` + (params ? '&' + params.toString() : '') + (paging.sort ? `&sort=${paging.sort}` : '')
    );
  }

  getTransactionsExport(isEnglish: boolean = true, paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http._getCall<TransactionDTO>(
      `${environment.apiUrl}/transactions/export/list?` +
      (paging.name ? `${isEnglish ? 'name' : 'nameAr'}=${paging.name}&` : '') +
      (params ? '&' + params.toString() : '') +
      (paging.sort ? `&sort=${paging.sort}` : '')
    );
  }

  getAllTransactions(): Observable<TransactionDTO[]> {
    return this.http._getCall<TransactionDTO[]>(`${environment.apiUrl}/transactions`);
  }

  getTransactionById(id: string): Observable<TransactionDTO> {
    return this.http._getCall<TransactionDTO>(`${environment.apiUrl}/transactions/${id}`);
  }

  getTransactionsByMeterId(meterId: string): Observable<TransactionDTO[]> {
    return this.http._getCall<TransactionDTO[]>(`${environment.apiUrl}/transactions/meter/${meterId}`);
  }

  addTransaction(record: TransactionDTO): Observable<any> {
    return this.http._postCall<any>(
      `${environment.apiUrl}/transactions`,
      record,
      false
    );
  }

  editTransaction(record: TransactionDTO): Observable<any> {
    return this.http._putCall<any>(
      `${environment.apiUrl}/transactions`,
      record,
      false
    );
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http._deleteCall<any>(
      `${environment.apiUrl}/transactions/${id}`,
    );
  }
} 
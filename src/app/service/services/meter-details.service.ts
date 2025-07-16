import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpService } from '@service/shared/http.service';
import { MeterDetailsDTO } from '@models/meter-details.dto';
import { paging_$Searching } from '@models/Utils/Pagination';

@Injectable({
  providedIn: 'root',
})
export class MeterDetailsService {
  constructor(public http: HttpService) {}

  getMeterDetailsByPaging(isEnglish: boolean = true, paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http._getCall<MeterDetailsDTO>(
      `${environment.apiUrl}/meter-details/filter?` +
      (paging.name ? `${isEnglish ? 'name' : 'nameAr'}=${paging.name}&` : '') +
      `page=${paging.page - 1}&size=${paging.size}` +
      (params ? '&' + params.toString() : '') +
      (paging.sort ? `&sort=${paging.sort}` : '')
    );
  }

  getMeterDetailsExport(isEnglish: boolean = true, paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http._getCall<MeterDetailsDTO>(
      `${environment.apiUrl}/meter-details/export/list?` +
      (paging.name ? `${isEnglish ? 'name' : 'nameAr'}=${paging.name}&` : '') +
      (params ? '&' + params.toString() : '') +
      (paging.sort ? `&sort=${paging.sort}` : '')
    );
  }

  getAllMeterDetails(): Observable<MeterDetailsDTO[]> {
    return this.http._getCall<MeterDetailsDTO[]>(`${environment.apiUrl}/meter-details`);
  }

  getMeterDetailsById(id: string): Observable<MeterDetailsDTO> {
    return this.http._getCall<MeterDetailsDTO>(`${environment.apiUrl}/meter-details/${id}`);
  }

  addMeterDetails(record: MeterDetailsDTO): Observable<any> {
    return this.http._postCall<any>(
      `${environment.apiUrl}/meter-details`,
      record,
      false
    );
  }

  editMeterDetails(record: MeterDetailsDTO): Observable<any> {
    return this.http._putCall<any>(
      `${environment.apiUrl}/meter-details`,
      record,
      false
    );
  }

  deleteMeterDetails(id: string): Observable<any> {
    return this.http._deleteCall<any>(
      `${environment.apiUrl}/meter-details/${id}`,
    );
  }
} 
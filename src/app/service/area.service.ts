
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

import { paging_$Searching } from '@model/Utils/Pagination';
import { HttpService } from '@service/shared/http.service';
import { Area, AreaDTo } from '@model/Setup/area.model';


@Injectable({
  providedIn: 'root',
})
export class AreaService {
  constructor(public http: HttpService) { }
  getRecordByPaging$Searching(isEnglish: boolean = true, paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http._getCall<AreaDTo>(
      `${environment.apiUrl}/areas/filter?` +
      (paging.name ? `${isEnglish ? 'name' : 'nameAr'}=${paging.name}&` : '') +
      `page=${paging.page - 1}&size=${paging.size}` +
      (params ? '&' + params.toString() : '') +
      (paging.sort ? `&sort=${paging.sort}` : '')
    );
  }
  getRecordsExport(isEnglish: boolean = true, paging: paging_$Searching, params: URLSearchParams): Observable<any> {
    return this.http._getCall<AreaDTo>(
      `${environment.apiUrl}/areas/export/list?` +
      (paging.name ? `${isEnglish ? 'name' : 'nameAr'}=${paging.name}&` : '') +
      (params ? '&' + params.toString() : '') +
      (paging.sort ? `&sort=${paging.sort}` : '')
    );
  }
  getAllRecords(): Observable<Area[]> {
    return this.http._getCall<Area[]>(`${environment.apiUrl}/areas`);
  }
  getOneRecordById(id: any): Observable<Area> {
    return this.http._getCall<Area>(`${environment.apiUrl}/areas/${id}`);
  }
  getAllRecordsByCityId(cityId: any): Observable<Area[]> {
    return this.http._getCall<Area[]>(`${environment.apiUrl}/areas/city/${cityId}`);
  }
  addRecord(record: Area): Observable<any> {
    return this.http._postCall<any>(
      `${environment.apiUrl}/areas`,
      record,
      false
    );
  }

  editRecord(record: any): Observable<any> {
    return this.http._putCall<any>(
      `${environment.apiUrl}/areas`,
      record,
      false
    );
  }

  deleteRecord(id: number) {
    return this.http._deleteCall<any>(
      `${environment.apiUrl}/areas/${id}`,
    );
  }

}

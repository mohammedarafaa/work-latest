// meter-consumption-history.service.ts
import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { Observable, catchError, of } from "rxjs";
import { environment } from "@environments/environment";
import { HttpService } from "@service/shared/http.service";
import {
  ApiResponseListDailyRecord,
  ApiResponsePageableDailyRecord,
} from "@model/meter-consumption-history.model";

@Injectable({ providedIn: "root" })
export class MeterConsumptionHistoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpService) {}

  /**
   * V2 API with Pagination: GET /api/meter-profile/consumption/daily/v2/{meterId}
   * Returns a pageable structure.
   * USED FOR TABLE VIEW with backend pagination.
   */
  getDailyConsumptionV2(
    meterId: number,
    months: number = 3,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponsePageableDailyRecord> {
    let params = new HttpParams()
      .set("months", months.toString())
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http
      ._getCall<ApiResponsePageableDailyRecord>(
        `${this.baseUrl}/meter-profile/consumption/daily/v2/${meterId}`,
        { params }
      )
      .pipe(
        catchError((error) => {
          console.error("V2 Pageable API Error:", error);
          return of({
            status: 500,
            message: "Error retrieving V2 pageable consumption data",
            data: {
              content: [],
              pageable: {
                pageNumber: page,
                pageSize: size,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: 0,
                paged: true,
                unpaged: false,
              },
              last: true,
              totalPages: 0,
              totalElements: 0,
              first: true,
              size: size,
              number: page,
              sort: { empty: true, sorted: false, unsorted: true },
              numberOfElements: 0,
              empty: true,
            },
            errors: error,
          });
        })
      );
  }

  /**
   * V2 List API: GET /api/meter-profile/consumption/daily/v2/{meterId}/list
   * Returns a full list of records without pagination.
   * USED FOR CHART VIEW with local pagination.
   */
  getDailyConsumptionV2List(
    meterId: number,
    months: number = 3
  ): Observable<ApiResponseListDailyRecord> {
    let params = new HttpParams().set("months", months.toString());

    return this.http
      ._getCall<ApiResponseListDailyRecord>(
        `${this.baseUrl}/meter-profile/consumption/daily/v2/${meterId}/list`,
        { params }
      )
      .pipe(
        catchError((error) => {
          console.error("V2 List API Error:", error);
          return of({
            status: 500,
            message: "Error retrieving V2 list consumption data",
            data: [],
            errors: error,
          });
        })
      );
  }
}

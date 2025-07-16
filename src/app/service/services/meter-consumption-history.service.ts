import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpService } from '@service/shared/http.service';
import { MeterDailyConsumptionDTO } from '@model/meter-consumption-history.model';

@Injectable({ providedIn: 'root' })
export class MeterConsumptionHistoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpService) {}

  /**
   * GET /api/meter-profile/consumption/daily
   * Fetch last N months of daily consumption (min 1, max 3)
   */
  getDailyConsumption(months: number = 3): Observable<MeterDailyConsumptionDTO> {
    if (months < 1) months = 1;
    if (months > 3) months = 3;
    const params = new HttpParams().set('months', months.toString());
    return this.http._getCall<MeterDailyConsumptionDTO>(
      `${this.baseUrl}/meter-profile/consumption/daily`,
      { params }
    );
  }
}

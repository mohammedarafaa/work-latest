import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpService } from '@service/shared/http.service';
import { MeterUsageMetricsDTO } from '@models/meter-usage-metrics.dto';

@Injectable({
  providedIn: 'root',
})
export class MeterUsageMetricsService {
  constructor(public http: HttpService) {}

  getUsageMetricsByMeterId(meterId: string): Observable<MeterUsageMetricsDTO> {
    return this.http._getCall<MeterUsageMetricsDTO>(
      `${environment.apiUrl}/meter-usage-metrics/${meterId}`
    );
  }

  getUsageMetricsByDateRange(
    meterId: string,
    startDate: string,
    endDate: string
  ): Observable<MeterUsageMetricsDTO> {
    return this.http._getCall<MeterUsageMetricsDTO>(
      `${environment.apiUrl}/meter-usage-metrics/${meterId}/range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  exportUsageMetrics(meterId: string): Observable<any> {
    return this.http._getCall<any>(
      `${environment.apiUrl}/meter-usage-metrics/${meterId}/export`
    );
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Meter } from '../models/meter.model';

@Injectable({
  providedIn: 'root'
})
export class MeterService {
  private apiUrl = `${environment.apiUrl}/Api/integration/meters`;

  constructor(private http: HttpClient) { }

  getAllMeters(): Observable<Meter[]> {
    return this.http.get<Meter[]>(this.apiUrl);
  }

  getMeter(id: number): Observable<Meter> {
    return this.http.get<Meter>(`${this.apiUrl}/${id}`);
  }

  saveMeter(meter: Meter): Observable<Meter> {
    return this.http.post<Meter>(this.apiUrl, meter);
  }

  deleteMeter(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
} 
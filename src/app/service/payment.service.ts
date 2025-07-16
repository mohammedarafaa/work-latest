import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentGateway } from '../models/payment-gateway.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/payment`;

  constructor(private http: HttpClient) { }

  getAllPaymentGateways(): Observable<PaymentGateway[]> {
    return this.http.get<PaymentGateway[]>(this.apiUrl);
  }

  getPaymentGateway(id: number): Observable<PaymentGateway> {
    return this.http.get<PaymentGateway>(`${this.apiUrl}/${id}`);
  }

  savePaymentGateway(paymentGateway: PaymentGateway): Observable<PaymentGateway> {
    return this.http.post<PaymentGateway>(this.apiUrl, paymentGateway);
  }

  updatePaymentGateway(id: number, paymentGateway: PaymentGateway): Observable<PaymentGateway> {
    return this.http.put<PaymentGateway>(`${this.apiUrl}/${id}`, paymentGateway);
  }

  deletePaymentGateway(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  initPayment(payload:any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/payments/initiate`,payload);
  }

  /// for Cib Payment
  initCIBPayment(merchantId:string,payload:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic bWVyY2hhbnQuVEVTVENJQjcwMTY4NDpjNGNmZDZhZTY3YmI3NjFlNjdjNjVjYTNhMjczODk1NA==',
      'Content-Type': 'text/plain'
    });
    return this.http.post<any>(`https://cibpaynow.gateway.mastercard.com/api/rest/version/100/merchant/${merchantId}/session`, payload, { headers });
  }
  //https://cibpaynow.gateway.mastercard.com/api/rest/version/100


  chargeMeterByCustomerService(payload:any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/meter-transactions`,payload);
  }
} 
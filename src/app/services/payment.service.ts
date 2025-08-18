import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = 'http://localhost:3000'; // Your Node server URL

  constructor(private http: HttpClient) {}

  initializePayment(paymentData: any) {
    return this.http.post(`${this.baseUrl}/initialize-payment`, paymentData);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill, AddPaymentRequest, PaginatedResponse } from '../../../core/models/bill.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = `${environment.apiUrl}/owner/bills`;

  constructor(private http: HttpClient) {}

  /**
   * Get all bills with pagination and filters
   */
  getBills(page: number = 1, limit: number = 10, filters?: any): Observable<PaginatedResponse<Bill>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.fromDate) {
        params = params.set('fromDate', filters.fromDate);
      }
      if (filters.toDate) {
        params = params.set('toDate', filters.toDate);
      }
    }

    return this.http.get<PaginatedResponse<Bill>>(this.apiUrl, { params });
  }

  /**
   * Get bill by ID
   */
  getBillById(billId: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.apiUrl}/${billId}`);
  }

  /**
   * Add payment to bill
   */
  addPaymentToBill(billId: string, payment: AddPaymentRequest): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/${billId}/payments`, payment);
  }

  /**
   * Delete payment from bill
   */
  deletePayment(billId: string, paymentId: string): Observable<Bill> {
    return this.http.delete<Bill>(`${this.apiUrl}/${billId}/payments/${paymentId}`);
  }

  /**
   * Create new bill
   */
  createBill(billData: Partial<Bill>): Observable<Bill> {
    return this.http.post<Bill>(this.apiUrl, billData);
  }

  /**
   * Update bill
   */
  updateBill(billId: string, billData: Partial<Bill>): Observable<Bill> {
    return this.http.put<Bill>(`${this.apiUrl}/${billId}`, billData);
  }

  /**
   * Delete bill
   */
  deleteBill(billId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${billId}`);
  }
}

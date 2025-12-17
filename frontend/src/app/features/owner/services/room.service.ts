import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, PaginatedResponse } from '../../../core/models/bill.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/owner/rooms`;

  constructor(private http: HttpClient) {}

  /**
   * Get all rooms with pagination and filters
   * Fixed: Now includes boarding house information in the response
   */
  getRooms(page: number = 1, limit: number = 10, filters?: any): Observable<PaginatedResponse<Room>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeBoardingHouse', 'true'); // ✅ Include boarding house info

    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.boardingHouseId) {
        params = params.set('boardingHouseId', filters.boardingHouseId);
      }
      if (filters.includeAll) {
        params = params.set('includeAll', 'true');
      }
    }

    return this.http.get<PaginatedResponse<Room>>(this.apiUrl, { params });
  }

  /**
   * Get room by ID
   */
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`);
  }

  /**
   * Create new room
   */
  createRoom(roomData: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, roomData);
  }

  /**
   * Update room
   */
  updateRoom(roomId: string, roomData: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${roomId}`, roomData);
  }

  /**
   * Delete room
   */
  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roomId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RoomSearchRequest,
  RoomSearchResponse,
  RoomDetailResponse,
} from '../models/room-search.model';

@Injectable({ providedIn: 'root' })
export class RoomSearchService {
  private http = inject(HttpClient);

  searchAvailableRooms(request: RoomSearchRequest): Observable<RoomSearchResponse> {
    return this.http.post<RoomSearchResponse>(
      `${environment.appUrl}/api/AvailableRoom/search`,
      request
    );
  }

  getRoomDetail(maPhong: number): Observable<RoomDetailResponse> {
    return this.http.get<RoomDetailResponse>(
      `${environment.appUrl}/api/AvailableRoom/detail/${maPhong}`
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateBookingPayload {
  maLoaiPhong: number;
  thoiGianBatDau: string; // ISO string
  lyDo: string;
  ghiChu?: string;
  soLuong: number;
}

export interface LoaiPhong {
  maLoaiPhong: number;
  tenLoaiPhong: string;
  viTri: string;
  moTa: string;
  trangThietBi: string;
  soLuongChoNgoi: string;
  thoiGianSuDung: string;
  thoiLuongToiDa: number | null;
  phongs: any[];
}

export interface CurrentBooking {
  maDangKy: number;
  maPhong: number;
  tenPhong: string;
  tenLoaiPhong: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  lyDo: string | null;
  soLuong: number | null;
  ghiChu: string | null;
  maTrangThai: number;
  tenTrangThai: string;
  ngayDuyet: string | null;
  ngayMuon: string;
  canStart: boolean;
  canExtend: boolean;
  canComplete: boolean;
  statusDescription: string;
  minutesUntilStart: number;
  minutesRemaining: number;
}

export interface CurrentBookingsResponse {
  success: boolean;
  data: CurrentBooking[];
  message: string;
}

export interface HistoryBooking {
  maDangKy: number;
  maPhong: number;
  tenPhong: string;
  tenLoaiPhong: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  gioBatDauThucTe: string | null;
  gioKetThucThucTe: string | null;
  lyDo: string | null;
  soLuong: number | null;
  ghiChu: string | null;
  maTrangThai: number;
  tenTrangThai: string;
  ngayDuyet: string | null;
  ngayMuon: string;
  tinhTrangPhong: string | null;
  ghiChuSuDung: string | null;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryBooking[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
  };
  message: string;
}

export interface CancelBookingPayload {
  lyDoHuy: string;
  ghiChu?: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
}

export interface ExtendBookingPayload {
  maDangKy: number;
  newEndTime: string; // ISO string
}

export interface ExtendBookingResponse {
  success: boolean;
  message: string;
}

export interface BookingDetail {
  maDangKy: number;
  maPhong: number;
  tenPhong: string;
  tenLoaiPhong: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  gioBatDauThucTe: string | null;
  gioKetThucThucTe: string | null;
  lyDo: string | null;
  soLuong: number | null;
  ghiChu: string | null;
  maTrangThai: number;
  tenTrangThai: string;
  ngayDuyet: string | null;
  ngayMuon: string;
  tinhTrangPhong: string | null;
  ghiChuSuDung: string | null;
}

export interface BookingDetailResponse {
  success: boolean;
  data: BookingDetail;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  createBooking(payload: CreateBookingPayload): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Booking/create`, payload);
  }

  getCurrentBookings(): Observable<CurrentBookingsResponse> {
    return this.http.get<CurrentBookingsResponse>(`${environment.appUrl}/api/Booking/current`);
  }

  /** Get booking history (used / canceled / rejected) with pagination */
  getBookingHistory(pageNumber = 1, pageSize = 10): Observable<HistoryResponse> {
    const url = `${environment.appUrl}/api/Booking/history?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<HistoryResponse>(url);
  }

  /** Search booking history with search term */
  searchBookingHistory(
    searchTerm: string,
    pageNumber = 1,
    pageSize = 10
  ): Observable<HistoryResponse> {
    const params = new URLSearchParams({
      searchTerm: searchTerm,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    const url = `${environment.appUrl}/api/v2/BookingView/search?${params.toString()}`;
    return this.http.get<HistoryResponse>(url);
  }

  getRoomTypes(): Observable<LoaiPhong[]> {
    return this.http.get<LoaiPhong[]>(`${environment.appUrl}/api/LoaiPhong/getall`);
  }

  /** Cancel a booking */
  cancelBooking(
    maDangKy: number,
    payload: CancelBookingPayload
  ): Observable<CancelBookingResponse> {
    return this.http.post<CancelBookingResponse>(
      `${environment.appUrl}/api/v2/BookingManagement/cancel/${maDangKy}`,
      payload
    );
  }

  /** Extend a booking */
  extendBooking(payload: ExtendBookingPayload): Observable<ExtendBookingResponse> {
    return this.http.post<ExtendBookingResponse>(
      `${environment.appUrl}/api/Booking/extend`,
      payload
    );
  }

  /** Get booking details */
  getBookingDetail(maDangKy: number): Observable<BookingDetailResponse> {
    return this.http.get<BookingDetailResponse>(
      `${environment.appUrl}/api/v2/BookingView/details/${maDangKy}`
    );
  }
}

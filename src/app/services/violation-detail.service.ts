import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

// API Response interface
export interface ApiViolationDetailResponse {
  success: boolean;
  data: {
    ghiChu: string;
    nguoiLapBienBan: string;
    maViPham: number;
    tenViPham: string;
    moTa: string;
    ngayLap: string;
    trangThaiXuLy: string;
    maDangKy: number;
    tenPhong: string;
    thoiGianViPham: string;
  };
}

// Frontend interface
export interface ViolationDetailData {
  id: string;
  violation_type: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  booking_id: string;
  student: {
    student_id: string;
    name: string;
    email: string;
  };
  room: {
    room_name: string;
  };
  booking: {
    start_time: string;
  };
  penalty?: {
    type: string;
    amount?: number;
    duration?: number;
    payment_status: string;
    notes?: string;
  };
  evidence?: Array<{
    file_name: string;
    file_type: string;
    file_size: number;
    description: string;
    uploaded_at: string;
  }>;
  notes?: string;
  reporter?: string;
  violation_time?: string;
}

export interface ViolationDetailResponse {
  success: boolean;
  data?: ViolationDetailData;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ViolationDetailService {
  private readonly apiUrl = environment.apiUrl || 'https://localhost:7100/api';

  constructor(private http: HttpClient) {}

  getViolationDetail(violationId: string): Observable<ViolationDetailResponse> {
    const headers = this.getAuthHeaders();

    return this.http
      .get<ApiViolationDetailResponse>(`${this.apiUrl}/api/v2/Violation/details/${violationId}`, {
        headers,
      })
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            const transformedData = this.transformApiDataToFrontend(response.data, violationId);
            return {
              success: true,
              data: transformedData,
            };
          }
          return {
            success: false,
            message: 'Không thể lấy thông tin vi phạm',
          };
        }),
        catchError((error) => {
          console.error('Error fetching violation detail:', error);
          let errorMessage = 'Có lỗi xảy ra khi lấy thông tin vi phạm';

          if (error.status === 404) {
            errorMessage = 'Không tìm thấy thông tin vi phạm';
          } else if (error.status === 401) {
            errorMessage = 'Không có quyền truy cập thông tin vi phạm';
          } else if (error.status === 500) {
            errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
          }

          return of({
            success: false,
            message: errorMessage,
          });
        })
      );
  }

  updateViolationStatus(
    violationId: string,
    newStatus: string
  ): Observable<ViolationDetailResponse> {
    // Mock API call for updating violation status
    console.log(`Updating violation ${violationId} to status: ${newStatus}`);

    return of({
      success: true,
      message: 'Cập nhật trạng thái vi phạm thành công',
    }).pipe(delay(500));
  }

  addViolationNote(violationId: string, note: string): Observable<ViolationDetailResponse> {
    // Mock API call for adding note
    console.log(`Adding note to violation ${violationId}: ${note}`);

    return of({
      success: true,
      message: 'Thêm ghi chú thành công',
    }).pipe(delay(500));
  }

  escalateViolation(violationId: string, reason: string): Observable<ViolationDetailResponse> {
    // Mock API call for escalating violation
    console.log(`Escalating violation ${violationId} with reason: ${reason}`);

    return of({
      success: true,
      message: 'Chuyển vi phạm lên cấp trên thành công',
    }).pipe(delay(500));
  }

  // Get student information from booking ID
  getStudentInfo(bookingId: string): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http
      .get<any>(`${this.apiUrl}/api/v2/Booking/details/${bookingId}`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching student info:', error);
          return of({
            success: false,
            data: {
              student: {
                student_id: 'Không xác định',
                name: 'Không xác định',
                email: 'Không xác định',
              },
            },
          });
        })
      );
  }

  // Helper methods
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private transformApiDataToFrontend(apiData: any, violationId: string): ViolationDetailData {
    return {
      id: violationId,
      violation_type: apiData.tenViPham || 'Không xác định',
      description: apiData.moTa || 'Không có mô tả',
      status: this.mapVietnameseStatusToEnglish(apiData.trangThaiXuLy),
      severity: this.determineSeverity(apiData.tenViPham),
      created_at: apiData.ngayLap || new Date().toISOString(),
      booking_id: apiData.maDangKy?.toString() || '',
      student: {
        student_id: 'sv02', // Will be updated after fetching booking details
        name: 'Đang tải thông tin...',
        email: 'Đang tải...',
      },
      room: {
        room_name: apiData.tenPhong || 'Không xác định',
      },
      booking: {
        start_time: apiData.thoiGianViPham || apiData.ngayLap || new Date().toISOString(),
      },
      notes: apiData.ghiChu || '',
      reporter: apiData.nguoiLapBienBan || 'Hệ thống',
      violation_time: apiData.thoiGianViPham,
      // Enhanced penalty info based on violation type
      penalty: this.generatePenaltyInfo(apiData.tenViPham, apiData.ghiChu),
      // Sample evidence data
      evidence: this.generateSampleEvidence(),
    };
  }

  private mapVietnameseStatusToEnglish(vietnameseStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'Chưa xử lý': 'pending',
      'Đang xử lý': 'processing',
      'Đã xử lý': 'resolved',
      'Từ chối': 'dismissed',
      'Chuyển lên cấp trên': 'escalated',
    };

    return statusMap[vietnameseStatus] || 'pending';
  }

  private determineSeverity(violationType: string): string {
    // Simple logic to determine severity based on violation type
    const severityKeywords = {
      high: ['mất', 'hư hỏng', 'phá hoại', 'đánh cắp'],
      medium: ['mang ra khỏi', 'vi phạm quy định', 'không tuân thủ'],
      low: ['trễ hạn', 'ồn ào', 'không đúng quy tắc'],
    };

    const lowerType = violationType.toLowerCase();

    for (const [severity, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some((keyword) => lowerType.includes(keyword))) {
        return severity;
      }
    }

    return 'medium'; // Default
  }

  private generatePenaltyInfo(violationType: string, notes: string): any {
    const lowerType = violationType.toLowerCase();

    if (lowerType.includes('mang') && lowerType.includes('ra khỏi')) {
      return {
        type: 'Cảnh cáo + Phạt tiền',
        amount: 50000,
        duration: 7,
        payment_status: 'pending',
        notes: notes || 'Vi phạm mang tài liệu ra khỏi thư viện',
      };
    } else if (lowerType.includes('hư hỏng') || lowerType.includes('mất')) {
      return {
        type: 'Bồi thường + Cấm sử dụng',
        amount: 200000,
        duration: 30,
        payment_status: 'pending',
        notes: notes || 'Vi phạm làm hư hỏng/mất tài liệu',
      };
    } else {
      return {
        type: 'Cảnh cáo',
        payment_status: 'waived',
        notes: notes || 'Vi phạm nhẹ, chỉ nhắc nhở',
      };
    }
  }

  private generateSampleEvidence(): any[] {
    return [
      {
        file_name: 'bang_chung_camera.mp4',
        file_type: 'video',
        file_size: 15728640, // 15MB
        description: 'Video camera an ninh ghi lại hành vi vi phạm',
        uploaded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        file_name: 'bien_ban_vi_pham.pdf',
        file_type: 'pdf',
        file_size: 524288, // 512KB
        description: 'Biên bản vi phạm được lập bởi nhân viên',
        uploaded_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        file_name: 'anh_hien_truong.jpg',
        file_type: 'image',
        file_size: 2097152, // 2MB
        description: 'Ảnh chụp hiện trường vi phạm',
        uploaded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
    ];
  }
}

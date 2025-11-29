export interface MyViolation {
  maViPham: number;
  tenViPham: string;
  moTa: string;
  ngayLap: string;
  trangThaiXuLy: string;
  maDangKy: number;
  tenPhong: string;
  thoiGianViPham: string;
}

export interface MyViolationDetail extends MyViolation {
  ghiChu: string;
  nguoiLapBienBan: string;
}

export interface MyViolationListResponse {
  success: boolean;
  data: MyViolation[];
  total: number;
}

export interface MyViolationDetailResponse {
  success: boolean;
  data: MyViolationDetail;
}

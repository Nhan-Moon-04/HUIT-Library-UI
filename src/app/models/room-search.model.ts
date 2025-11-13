export interface RoomSearchRequest {
  thoiGianBatDau: string; // ISO string
  maLoaiPhong: number;
  thoiGianSuDung: number; // hours
  sucChuaToiThieu: number;
}

export interface AvailableRoom {
  maPhong: number;
  tenPhong: string;
  tenLoaiPhong: string;
  sucChua: string;
  viTri: string | null;
}

export interface RoomSearchResponse {
  message: string;
  data: AvailableRoom[];
}

export interface RoomResource {
  tenTaiNguyen: string;
  soLuong: number;
  tinhTrang: string | null;
}

export interface RoomDetail {
  maPhong: number;
  tenPhong: string;
  tenLoaiPhong: string;
  sucChua: string;
  viTri: string | null;
  moTa: string | null;
  taiNguyen: RoomResource[];
}

export interface RoomDetailResponse {
  message: string;
  data: RoomDetail;
}

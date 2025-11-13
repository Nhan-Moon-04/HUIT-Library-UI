export interface LoginRequest {
  maDangNhap: string;
  matKhau: string;
}

export interface RegisterRequest {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  maSinhVien: string;
  lop: string;
  khoaHoc: string;
  vaiTro: string;
}

export interface User {
  maNguoiDung: number;
  maCode: string;
  maSinhVien: string | null;
  maNhanVien: string | null;
  hoTen: string;
  email: string;
  soDienThoai: string;
  vaiTro: string;
  lop: string;
  khoaHoc: string;
  ngaySinh: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export type VaiTro = 'SINH_VIEN' | 'NHAN_VIEN' | 'QUAN_LY';

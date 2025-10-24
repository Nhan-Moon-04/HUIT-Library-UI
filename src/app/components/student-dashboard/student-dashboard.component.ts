import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-placeholder">
              <i class="fas fa-university"></i>
            </div>
            <div class="university-info">
              <h1 class="university-name">TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h1>
              <h2 class="system-name">HỆ THỐNG QUẢN LÝ TÀI NGUYÊN PHÒNG HỌP</h2>
              <p class="section-name">Khu vực sinh viên</p>
            </div>
          </div>
          <div class="user-section">
            <div class="user-info" (click)="router.navigate(['/profile'])" style="cursor:pointer;">
              <i class="fas fa-user-graduate"></i>
              <div>
                <p class="user-name">{{ authService.currentUser()?.hoTen }}</p>
                <p class="user-code">{{ authService.currentUser()?.maCode }}</p>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="welcome-section">
          <h2>Chào mừng, {{ authService.currentUser()?.hoTen }}!</h2>
          <p>Bạn đang truy cập với quyền sinh viên — Trung tâm Thông tin Thư viện</p>
        </div>

        <div class="features-grid">
          <!-- Row 1 -->
          <div
            class="feature-card feature-search"
            (click)="router.navigate(['/search'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle cold">
              <i class="fas fa-search"></i>
            </div>
            <h3>Tìm kiếm</h3>
            <p>Tìm sách, tài liệu và nguồn học</p>
          </div>

          <div
            class="feature-card feature-room"
            (click)="router.navigate(['/booking/create'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle warm">
              <i class="fas fa-door-open"></i>
            </div>
            <h3>Đặt phòng</h3>
            <p>Yêu cầu phòng học/nhóm</p>
          </div>

          <div
            class="feature-card feature-loans"
            (click)="router.navigate(['/loans'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle cold">
              <i class="fas fa-book-reader"></i>
            </div>
            <h3>Phòng Nhận / Mượn</h3>
            <p>Danh sách sách đang mượn & quản lý</p>
          </div>

          <!-- Row 2 -->
          <div class="feature-card feature-history">
            <div class="icon-circle warm">
              <i class="fas fa-history"></i>
            </div>
            <h3>Lịch sử mượn</h3>
            <p>Xem lịch sử mượn tài liệu</p>
          </div>

          <div class="feature-card feature-fav">
            <div class="icon-circle cold">
              <i class="fas fa-heart"></i>
            </div>
            <h3>Yêu thích</h3>
            <p>Danh sách sách bạn đã đánh dấu</p>
          </div>

          <div
            class="feature-card feature-notify"
            (click)="router.navigate(['/notifications'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle warm">
              <i class="fas fa-bell"></i>
            </div>
            <h3>Thông báo</h3>
            <p>Cập nhật từ thư viện</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .dashboard-header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 30px 0;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .logo-placeholder {
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        color: #2a5298;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .university-name {
        font-size: 16px;
        font-weight: 700;
        margin: 0;
        line-height: 1.3;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .system-name {
        font-size: 14px;
        font-weight: 500;
        margin: 5px 0;
        opacity: 0.95;
        letter-spacing: 0.3px;
      }

      .section-name {
        font-size: 14px;
        margin: 5px 0 0 0;
        opacity: 0.9;
        color: #74b9ff;
        font-weight: 500;
      }

      .user-section {
        display: flex;
        align-items: center;
        gap: 25px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 15px;
        border-radius: 10px;
        transition: all 0.3s ease;
      }

      .user-info:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .user-info i {
        font-size: 28px;
        color: #74b9ff;
      }

      .user-name {
        font-weight: 600;
        margin: 0;
        font-size: 16px;
      }

      .user-code {
        margin: 0;
        opacity: 0.8;
        font-size: 14px;
      }

      .logout-btn {
        background: linear-gradient(135deg, #ff7a18 0%, #ff4e00 100%);
        border: none;
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 94, 0, 0.3);
      }

      .logout-btn:hover {
        background: linear-gradient(135deg, #ff4e00 0%, #ff7a18 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 78, 0, 0.4);
      }

      .dashboard-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 50px 20px;
      }

      .welcome-section {
        text-align: center;
        margin-bottom: 50px;
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      }

      .welcome-section h2 {
        color: #2c3e50;
        font-size: 36px;
        margin: 0 0 12px 0;
        font-weight: 700;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-section p {
        color: #7f8c8d;
        font-size: 16px;
        margin: 0;
        line-height: 1.6;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 30px;
      }

      .feature-card {
        background: linear-gradient(180deg, #ffffff, #fffdf9);
        padding: 30px 25px;
        border-radius: 20px;
        box-shadow: 0 8px 30px rgba(13, 38, 63, 0.08);
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        min-height: 200px;
        border: 1px solid rgba(0, 0, 0, 0.02);
        position: relative;
        overflow: hidden;
      }

      .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      .feature-card:hover::before {
        transform: scaleX(1);
      }

      .feature-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 45px rgba(13, 38, 63, 0.15);
      }

      .icon-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .feature-card:hover .icon-circle {
        transform: scale(1.1);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
      }

      .icon-circle.cold {
        background: linear-gradient(135deg, #2aa4f4, #1e78d7);
      }
      .icon-circle.warm {
        background: linear-gradient(135deg, #ff7a18, #ff4e00);
      }

      .feature-card h3 {
        color: #2c3e50;
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }

      .feature-card p {
        color: #7f8c8d;
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        max-width: 200px;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          padding: 25px 0;
        }

        .header-content {
          flex-direction: column;
          gap: 25px;
          text-align: center;
        }

        .logo-section {
          flex-direction: column;
          gap: 15px;
        }

        .university-name {
          font-size: 14px;
        }

        .system-name {
          font-size: 12px;
        }

        .user-section {
          width: 100%;
          justify-content: space-between;
        }

        .dashboard-main {
          padding: 30px 15px;
        }

        .welcome-section {
          padding: 30px 20px;
          margin-bottom: 40px;
        }

        .welcome-section h2 {
          font-size: 28px;
        }

        .features-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .feature-card {
          min-height: 180px;
          padding: 25px 20px;
        }
      }
    `,
  ],
})
export class StudentDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}

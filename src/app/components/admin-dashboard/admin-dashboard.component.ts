import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
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
            <div class="system-info">
              <h1>Thư viện điện tử HUIT</h1>
              <p>Khu vực quản lý</p>
            </div>
          </div>
          <div class="user-section">
            <div class="user-info" (click)="router.navigate(['/profile'])" style="cursor:pointer;">
              <i class="fas fa-user-cog"></i>
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
          <p>Bạn đang truy cập với quyền quản trị viên hệ thống</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <i class="fas fa-users-cog"></i>
            <h3>Quản lý người dùng</h3>
            <p>Quản lý tài khoản sinh viên và nhân viên</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-database"></i>
            <h3>Quản lý hệ thống</h3>
            <p>Cấu hình và quản lý hệ thống</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-chart-line"></i>
            <h3>Thống kê tổng quan</h3>
            <p>Báo cáo và thống kê toàn hệ thống</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Phân quyền</h3>
            <p>Quản lý quyền truy cập hệ thống</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-cogs"></i>
            <h3>Cài đặt</h3>
            <p>Cấu hình tham số hệ thống</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-file-alt"></i>
            <h3>Nhật ký hệ thống</h3>
            <p>Xem nhật ký hoạt động</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-backup"></i>
            <h3>Sao lưu dữ liệu</h3>
            <p>Backup và restore dữ liệu</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-bell"></i>
            <h3>Thông báo</h3>
            <p>Quản lý thông báo hệ thống</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background: #f8f9fa;
      }

      .dashboard-header {
        background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);
        color: white;
        padding: 20px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        gap: 15px;
      }

      .logo-placeholder {
        width: 60px;
        height: 60px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: #6c3483;
      }

      .system-info h1 {
        font-size: 24px;
        margin: 0;
        font-weight: 600;
      }

      .system-info p {
        margin: 5px 0 0 0;
        opacity: 0.9;
        font-size: 14px;
      }

      .user-section {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-info i {
        font-size: 24px;
        color: #af7ac5;
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
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .logout-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .dashboard-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .welcome-section {
        text-align: center;
        margin-bottom: 40px;
      }

      .welcome-section h2 {
        color: #2c3e50;
        font-size: 32px;
        margin: 0 0 10px 0;
      }

      .welcome-section p {
        color: #7f8c8d;
        font-size: 16px;
        margin: 0;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
      }

      .feature-card {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
      }

      .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .feature-card i {
        font-size: 48px;
        color: #8e44ad;
        margin-bottom: 20px;
      }

      .feature-card h3 {
        color: #2c3e50;
        margin: 0 0 12px 0;
        font-size: 20px;
      }

      .feature-card p {
        color: #7f8c8d;
        margin: 0;
        line-height: 1.5;
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 20px;
        }

        .user-section {
          width: 100%;
          justify-content: space-between;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}

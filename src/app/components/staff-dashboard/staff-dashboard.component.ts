import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <main class="dashboard-main">
        <div class="container">
          <!-- Welcome Banner -->
          <div class="welcome-banner">
            <div class="banner-content">
              <h2>Chào mừng, {{ getGreetingTitle() }}{{ authService.currentUser()?.hoTen }}!</h2>
              <p>Chúc bạn một ngày làm việc hiệu quả tại thư viện HUIT.</p>
            </div>
            <div class="banner-icon">
              <i class="fas fa-user-tie"></i>
            </div>
          </div>

          <!-- Quick Stats -->
          <section class="quick-stats">
            <div class="stat-card" (click)="router.navigate(['/bookings'])">
              <div class="stat-icon icon-booking">
                <i class="fas fa-door-open"></i>
              </div>
              <div class="stat-info">
                <h3>Phòng đang sử dụng</h3>
                <p>Xem các phòng bạn đã đặt</p>
              </div>
            </div>
            <div class="stat-card" (click)="router.navigate(['/bookings'])">
              <div class="stat-icon icon-pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h3>Yêu cầu chờ duyệt</h3>
                <p>Các yêu cầu đặt phòng của bạn</p>
              </div>
            </div>
            <div class="stat-card" (click)="router.navigate(['/bookings/history'])">
              <div class="stat-icon icon-history">
                <i class="fas fa-history"></i>
              </div>
              <div class="stat-info">
                <h3>Lịch sử đặt phòng</h3>
                <p>Xem lại các hoạt động trước đây</p>
              </div>
            </div>
            <div class="stat-card" (click)="router.navigate(['/violations'])">
              <div class="stat-icon icon-violation">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="stat-info">
                <h3>Xem vi phạm</h3>
                <p>Quản lý các vi phạm của sinh viên</p>
              </div>
            </div>
          </section>

          <!-- Features Grid -->
          <section class="features-section">
            <h3 class="section-title">TIỆN ÍCH DÀNH CHO GIẢNG VIÊN</h3>
            <div class="features-grid">
              <div class="feature-card" (click)="router.navigate(['/room-search'])">
                <div class="card-icon search"><i class="fas fa-search"></i></div>
                <div class="card-content">
                  <h4>Tra cứu phòng</h4>
                  <p>Tìm phòng học, phòng hội thảo, phòng nghiên cứu.</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/booking/create'])">
                <div class="card-icon booking"><i class="fas fa-calendar-check"></i></div>
                <div class="card-content">
                  <h4>Đặt phòng nghiên cứu</h4>
                  <p>Đăng ký phòng cho hoạt động giảng dạy và nghiên cứu.</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/notifications'])">
                <div class="card-icon notify"><i class="fas fa-bell"></i></div>
                <div class="card-content">
                  <h4>Thông báo học thuật</h4>
                  <p>Cập nhật tin tức từ phòng đào tạo và NCKH.</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/profile'])">
                <div class="card-icon profile"><i class="fas fa-id-card"></i></div>
                <div class="card-content">
                  <h4>Hồ sơ cá nhân</h4>
                  <p>Quản lý thông tin và các thiết lập tài khoản.</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Footer -->
      <footer class="library-footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-info">
              <h4>TRUNG TÂM THƯ VIỆN - ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h4>
              <p>
                <i class="fas fa-map-marker-alt"></i> Địa chỉ: 140 Lê Trọng Tấn, P.Tây Thạnh, Q.Tân
                Phú, TP.HCM
              </p>
              <p><i class="fas fa-phone"></i> Điện thoại: (028) 3865 2881</p>
              <p><i class="fas fa-envelope"></i> Email: thuviendhct@hufi.edu.vn</p>
            </div>
            <div class="footer-hours">
              <h5>Giờ mở cửa</h5>
              <p>Thứ 2 - Thứ 6: 7:00 - 21:00</p>
              <p>Thứ 7: 7:00 - 17:00</p>
              <p>Chủ nhật: 8:00 - 12:00</p>
            </div>
          </div>
          <div class="footer-copyright">
            <p>&copy; 2024 Thư viện Đại học Công Thương TP.HCM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        --primary-color: #004a9f; /* HUIT blue */
        --secondary-color: #d32f2f; /* HUIT red */
        --accent-color: #fbc02d; /* Yellow accent */
        --bg-light: #f8f9fa;
        --bg-gradient: linear-gradient(to bottom, #f5f7fa, #e3f2fd);
        --text-dark: #263238;
        --text-light: #546e7a;
        --card-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
      }

      .dashboard-container {
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        background: var(--bg-gradient);
        color: var(--text-dark);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      /* Welcome Banner */
      .welcome-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, var(--primary-color), #1e88e5);
        padding: 2rem 2.5rem;
        border-radius: 8px; /* Giảm độ bo góc */
        margin-bottom: 2.5rem;
        box-shadow: var(--card-shadow);
        color: #fff;
      }
      .banner-content h2 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .banner-content p {
        font-size: 1rem;
        opacity: 0.9;
      }
      .banner-icon i {
        font-size: 4rem;
        opacity: 0.2;
        transform: rotate(-15deg);
      }

      /* Quick Stats */
      .quick-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 3rem;
      }
      .stat-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        background: #fff;
        padding: 1.5rem;
        border-radius: 8px; /* Giảm độ bo góc */
        box-shadow: var(--card-shadow);
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        color: #fff;
      }
      .stat-icon.icon-booking {
        background: #4caf50;
      }
      .stat-icon.icon-pending {
        background: #ff9800;
      }
      .stat-icon.icon-history {
        background: #9c27b0;
      }
      .stat-icon.icon-violation {
        background: #f44336;
      }

      .stat-info h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
      .stat-info p {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        color: var(--text-light);
      }

      /* Features Grid */
      .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        text-align: center;
      }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .feature-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: #fff;
        padding: 1.5rem;
        border-radius: 8px; /* Giảm độ bo góc */
        box-shadow: var(--card-shadow);
        transition: all 0.3s ease;
        cursor: pointer;
        border-left: 5px solid transparent;
      }
      .feature-card:hover {
        transform: translateY(-5px);
        border-left-color: var(--secondary-color);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .card-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px; /* Giảm độ bo góc */
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 1.5rem;
      }
      .card-icon.search {
        background: #2196f3;
      }
      .card-icon.booking {
        background: #4caf50;
      }
      .card-icon.notify {
        background: #f44336;
      }
      .card-icon.profile {
        background: #673ab7;
      }

      .card-content h4 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
      .card-content p {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        color: var(--text-light);
        line-height: 1.4;
      }
      .card-arrow {
        margin-left: auto;
        color: #b0bec5;
        transition: transform 0.3s ease;
      }
      .feature-card:hover .card-arrow {
        transform: translateX(5px);
        color: var(--secondary-color);
      }

      /* Footer */
      .library-footer {
        background: #1e293b;
        color: #f1f5f9;
        padding: 3rem 1rem 1.5rem;
        font-size: 0.9rem;
      }
      .footer-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2.5rem;
        margin-bottom: 2rem;
      }
      .footer-info h4 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #60a5fa;
      }
      .footer-info p,
      .footer-hours p {
        margin: 0.5rem 0;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .footer-hours h5 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        color: #60a5fa;
      }
      .footer-copyright {
        border-top: 1px solid #334155;
        padding-top: 1.5rem;
        text-align: center;
        font-size: 0.8rem;
        color: #94a3b8;
      }

      @media (max-width: 768px) {
        .container {
          padding: 1.5rem 1rem;
        }
        .quick-stats {
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .stat-card {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
          padding: 1rem;
        }
        .welcome-banner {
          flex-direction: column;
          text-align: center;
          gap: 1.5rem;
          padding: 1.5rem;
        }
        .banner-content h2 {
          font-size: 1.5rem;
        }
        .footer-content {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 480px) {
        .quick-stats {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StaffDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  getGreetingTitle(): string {
    const user = this.authService.currentUser();
    if (!user) return '';

    switch (user.vaiTro) {
      case 'GIANG_VIEN':
        return 'Th.S ';
      case 'NHAN_VIEN':
        return '';
      default:
        return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

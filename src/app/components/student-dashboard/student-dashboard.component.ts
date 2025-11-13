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
      <main class="library-main">
        <div class="container">
          <!-- Welcome Banner -->
          <div class="welcome-banner">
            <div class="banner-content">
              <h2>Chào mừng bạn đến với Trung tâm Thư viện HUIT</h2>
              <p>Quản lý và đặt phòng học tập dễ dàng tại thư viện HUIT</p>
            </div>
            <div class="banner-icon">
              <i class="fas fa-university"></i>
            </div>
          </div>

          <!-- Quick Stats -->
          <section class="quick-stats">
            <div class="stat-card primary">
              <div class="stat-icon">
                <i class="fas fa-door-open"></i>
              </div>
              <div class="stat-info">
                <h3>12</h3>
                <p>Phòng đang mượn</p>
              </div>
            </div>
            <div class="stat-card success">
              <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <h3>24</h3>
                <p>Đặt phòng thành công</p>
              </div>
            </div>
            <div class="stat-card warning">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h3>3</h3>
                <p>Đang chờ duyệt</p>
              </div>
            </div>
          </section>

          <!-- Features Grid -->
          <section class="features-section">
            <h3 class="section-title">DỊCH VỤ THƯ VIỆN</h3>
            <div class="features-grid">
              <div class="feature-card" (click)="router.navigate(['/room-search'])">
                <div class="card-icon search"><i class="fas fa-search"></i></div>
                <div class="card-content">
                  <h4>Tra cứu phòng</h4>
                  <p>Tìm kiếm thông tin phòng học, phòng họp nhóm</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/booking/create'])">
                <div class="card-icon booking"><i class="fas fa-calendar-check"></i></div>
                <div class="card-content">
                  <h4>Đặt phòng</h4>
                  <p>Đăng ký sử dụng phòng học, phòng họp nhóm</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/loans'])">
                <div class="card-icon loans"><i class="fas fa-clipboard-list"></i></div>
                <div class="card-content">
                  <h4>Phòng đang mượn</h4>
                  <p>Quản lý danh sách phòng đang sử dụng</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/bookings/history'])">
                <div class="card-icon history"><i class="fas fa-history"></i></div>
                <div class="card-content">
                  <h4>Lịch sử đặt phòng</h4>
                  <p>Xem lịch sử đặt và sử dụng phòng</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/notifications'])">
                <div class="card-icon notify"><i class="fas fa-bell"></i></div>
                <div class="card-content">
                  <h4>Thông báo</h4>
                  <p>Tin tức & thông báo từ thư viện</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
              <div class="feature-card" (click)="router.navigate(['/regulations'])">
                <div class="card-icon regulation"><i class="fas fa-file-alt"></i></div>
                <div class="card-content">
                  <h4>Quy định sử dụng</h4>
                  <p>Nội quy & hướng dẫn sử dụng phòng</p>
                </div>
                <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
              </div>
            </div>
          </section>

          <!-- Announcements -->
          <section class="announcements-section">
            <div class="section-header">
              <h3 class="section-title">THÔNG BÁO MỚI</h3>
              <a class="view-all" (click)="router.navigate(['/notifications'])">Xem tất cả</a>
            </div>
            <div class="announcements-list">
              <div class="announcement-item new">
                <div class="announcement-badge">MỚI</div>
                <div class="announcement-content">
                  <h4>Lịch nghỉ lễ 30/4 - 1/5</h4>
                  <p>Thư viện sẽ đóng cửa từ 29/4 đến 2/5</p>
                  <span class="announcement-date">25/04/2024</span>
                </div>
              </div>
              <div class="announcement-item">
                <div class="announcement-content">
                  <h4>Thay đổi giờ mở cửa</h4>
                  <p>Từ 15/5, thư viện mở cửa 7:00 - 21:00</p>
                  <span class="announcement-date">20/04/2024</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    <!-- Footer -->
    <footer class="library-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <h4>THƯ VIỆN ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h4>
            <p>Địa chỉ: 140 Lê Trọng Tấn, P.Tây Thạnh, Q.Tân Phú, TP.HCM</p>
            <p>Điện thoại: (028) 3865 2881 - Email: thuviendhct@hufi.edu.vn</p>
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
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        font-family: 'Inter', sans-serif;
        background: linear-gradient(to bottom, #f5f7fa, #e3f2fd);
        color: #263238;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      /* Welcome Banner */
      .welcome-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #dfb5cdff, #ee98cdff);

        padding: 25px 30px;
        border-radius: 12px;
        margin-bottom: 30px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        color: #fff;
      }
      .banner-content h2 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      .banner-content p {
        font-size: 14px;
        opacity: 0.85;
      }
      .banner-icon i {
        font-size: 48px;
        opacity: 0.9;
      }

      /* Quick Stats */
      .quick-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }
      .stat-card {
        display: flex;
        align-items: center;
        gap: 15px;
        background: #fff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      }
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
      }
      .stat-icon.primary {
        background: #1976d2;
      }
      .stat-icon.success {
        background: #388e3c;
      }
      .stat-icon.warning {
        background: #f57c00;
      }
      .stat-info h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }
      .stat-info p {
        margin: 2px 0 0 0;
        font-size: 12px;
        color: #78909c;
      }

      /* Feature Grid */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }
      .feature-card {
        display: flex;
        align-items: center;
        gap: 15px;
        background: #fff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        cursor: pointer;
        border-left: 4px solid transparent;
      }
      .feature-card:hover {
        transform: translateY(-3px);
        border-left: 4px solid #1976d2;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.12);
      }
      .card-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
      }
      .card-icon.search {
        background: #2196f3;
      }
      .card-icon.booking {
        background: #4caf50;
      }
      .card-icon.loans {
        background: #ff9800;
      }
      .card-icon.history {
        background: #9c27b0;
      }
      .card-icon.notify {
        background: #f44336;
      }
      .card-icon.regulation {
        background: #607d8b;
      }
      .card-content h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      .card-content p {
        margin: 2px 0 0 0;
        font-size: 12px;
        color: #78909c;
      }
      .card-arrow {
        color: #b0bec5;
      }

      /* Announcements */
      .announcements-section {
        margin-bottom: 40px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #1a237e;
      }
      .view-all {
        color: #1976d2;
        font-size: 12px;
        text-decoration: none;
        cursor: pointer;
      }
      .view-all:hover {
        text-decoration: underline;
      }
      .announcements-list {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
      }
      .announcement-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 15px 20px;
        border-bottom: 1px solid #eceff1;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .announcement-item:hover {
        background: #f1f5f9;
      }
      .announcement-item.new {
        background: #e3f2fd;
      }
      .announcement-badge {
        background: #ff5722;
        color: #fff;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 700;
      }
      .announcement-content h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .announcement-content p {
        margin: 2px 0 0 0;
        font-size: 12px;
        color: #78909c;
      }
      .announcement-date {
        font-size: 11px;
        color: #b0bec5;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .welcome-banner {
          flex-direction: column;
          text-align: center;
          gap: 15px;
        }
        .features-grid {
          grid-template-columns: 1fr;
        }
      }
      /* Footer */
      .library-footer {
        background: #1e293b; /* màu tối, nổi bật với phần main */
        color: #f1f5f9;
        padding: 30px 0 15px;
        font-size: 13px;
      }

      .footer-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 40px;
        margin-bottom: 20px;
      }

      .footer-info h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #60a5fa;
      }

      .footer-info p,
      .footer-hours p {
        margin: 5px 0;
        font-size: 12px;
        color: #cbd5e1;
      }

      .footer-hours h5 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #60a5fa;
      }

      .footer-copyright {
        border-top: 1px solid #334155;
        padding-top: 15px;
        text-align: center;
      }

      .footer-copyright p {
        margin: 0;
        font-size: 11px;
        color: #94a3b8;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .footer-content {
          grid-template-columns: 1fr;
          gap: 20px;
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

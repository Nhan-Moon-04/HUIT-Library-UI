import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-library-regulations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="regulations-container-v2">
      <div class="regulations-wrapper-v2">
        <header class="regulations-header-v2">
          <button class="back-btn-v2" (click)="router.navigate(['/'])" aria-label="Quay lại trang chính">
            <i class="fas fa-arrow-left"></i>
            <span>Quay lại</span>
          </button>
          <div class="header-title-content">
            <h1>Quy định sử dụng Thư viện</h1>
            <p>Trường Đại học Công Thương TP.HCM</p>
          </div>
        </header>

        <main class="regulations-main-v2">
          <div class="introduction-card">
              <i class="fas fa-exclamation-triangle"></i>
              <p>Việc nắm rõ và tuân thủ các quy định dưới đây là bắt buộc đối với tất cả sinh viên và giảng viên khi sử dụng phòng học tập.</p>
          </div>

          <section class="regulation-card">
            <h2><i class="fas fa-bookmark icon-gold"></i> 1. Quy định chung</h2>
            <p>Khi sử dụng hệ thống mượn phòng, người dùng cần tuân thủ các quy định sau:</p>
            <ul class="regulation-list">
              <li><i class="fas fa-circle-check list-check"></i> Đăng nhập bằng tài khoản hợp lệ do nhà trường cấp.</li>
              <li><i class="fas fa-circle-check list-check"></i> Chỉ mượn phòng theo thời gian đã đăng ký; **không chiếm dụng phòng** khi chưa đến lượt.</li>
              <li><i class="fas fa-circle-check list-check"></i> Giữ trật tự, vệ sinh trong phòng và khu vực xung quanh.</li>
              <li><i class="fas fa-circle-check list-check"></i> Không mang đồ ăn, nước uống (không đóng chai) vào phòng.</li>
              <li><i class="fas fa-circle-check list-check"></i> **Không phá hỏng** hoặc di chuyển thiết bị, bàn ghế trong phòng.</li>
              <li><i class="fas fa-circle-check list-check"></i> Chỉ sử dụng phòng cho mục đích **học tập, họp nhóm**; không tổ chức sự kiện hay mục đích cá nhân khác.</li>
            </ul>
          </section>

          <section class="regulation-card">
            <h2><i class="fas fa-clipboard-list icon-gold"></i> 2. Đăng ký mượn phòng</h2>
            <ul class="regulation-list">
              <li><i class="fas fa-clock list-check"></i> Người dùng phải đăng ký trực tuyến qua hệ thống.</li>
              <li><i class="fas fa-clock list-check"></i> Thời gian mỗi lượt mượn: **tối đa 120 phút**; có thể gia hạn nếu không có người chờ.</li>
              <li><i class="fas fa-clock list-check"></i> Hủy đăng ký trước ít nhất **15 phút** nếu không sử dụng.</li>
              <li><i class="fas fa-clock list-check"></i> Hệ thống ưu tiên theo thứ tự đăng ký; không được đăng ký trùng phòng cùng khung giờ với người khác.</li>
            </ul>
          </section>

          <section class="regulation-card">
            <h2><i class="fas fa-key icon-gold"></i> 3. Sử dụng và trả phòng</h2>
            <ul class="regulation-list">
              <li><i class="fas fa-door-open list-check"></i> Đi vào phòng đúng giờ đã đăng ký và ra khỏi phòng khi kết thúc giờ mượn.</li>
              <li><i class="fas fa-door-open list-check"></i> Bàn ghế, thiết bị phải để gọn gàng, **nguyên trạng** trước khi rời phòng.</li>
              <li><i class="fas fa-door-open list-check"></i> Báo ngay cho quản lý nếu phát hiện hư hỏng hoặc thiếu thiết bị trong phòng.</li>
              <li><i class="fas fa-door-open list-check"></i> Người mượn chịu trách nhiệm nếu làm hư hỏng tài sản của thư viện.</li>
            </ul>
          </section>

          <section class="regulation-card violation-card">
            <h2><i class="fas fa-gavel icon-gold"></i> 4. Xử lý vi phạm</h2>
            <ul class="regulation-list">
              <li><i class="fas fa-times-circle list-danger"></i> **Chiếm dụng phòng quá giờ:** hệ thống sẽ tự động khóa lượt mượn tiếp theo của người dùng.</li>
              <li><i class="fas fa-times-circle list-danger"></i> **Hư hỏng thiết bị, nội thất:** người mượn phải đền bù theo quy định của thư viện.</li>
              <li><i class="fas fa-times-circle list-danger"></i> **Vi phạm các quy định khác:** cảnh cáo, khóa tài khoản tạm thời hoặc vĩnh viễn tùy mức độ nghiêm trọng.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* -------------------------------------------------------------------------- */
    /* GLOBAL STYLES & LIGHT MODE BASE */
    /* -------------------------------------------------------------------------- */
    :host {
      --bg-light: #f4f6f9; /* Background chính: Xám Nhạt */
      --card-white: #ffffff; /* Màu nền cho Card: Trắng */
      --color-primary: #00a896; /* Xanh Mint/Teal Accent */
      --color-gold: #2c3e50; /* Navy đậm (thay thế cho Gold) */
      --color-text: #34495e; /* Xám Đậm Text */
      --color-text-sub: #7f8c8d; /* Xám Trung bình Subtitle */
      --color-shadow: rgba(0, 0, 0, 0.08); /* Shadow nhẹ nhàng */
    }

    .regulations-container-v2 {
      font-family: 'Inter', sans-serif;
      background: var(--bg-light);
      color: var(--color-text);
      min-height: 100vh;
      padding: 50px 20px;
      display: flex;
      justify-content: center;
    }

    .regulations-wrapper-v2 {
      width: 100%;
      max-width: 1000px;
    }

    /* -------------------------------------------------------------------------- */
    /* HEADER STYLES */
    /* -------------------------------------------------------------------------- */
    .regulations-header-v2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: linear-gradient(90deg, var(--color-primary), #00c6a8); /* Light Green Gradient */
      padding: 25px 30px;
      border-radius: 15px;
      box-shadow: 0 15px 40px rgba(0, 168, 150, 0.3); /* Shadow dựa trên màu Primary */
      position: relative;
    }

    .header-title-content {
      text-align: center;
      flex-grow: 1;
      margin-left: -120px; 
    }
    
    .regulations-header-v2 h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: white; /* Giữ màu trắng cho tiêu đề trên nền màu */
    }

    .regulations-header-v2 p {
        margin: 5px 0 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8); /* Màu trắng hơi mờ */
    }

    .back-btn-v2 {
      background: var(--color-gold); /* Navy đậm */
      border: none;
      color: white;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(44, 62, 80, 0.4);
      z-index: 10;
    }
    .back-btn-v2:hover {
        background: #34495e; /* Màu đậm hơn khi hover */
        transform: translateY(-2px);
    }

    /* -------------------------------------------------------------------------- */
    /* MAIN CONTENT & CARD STYLES */
    /* -------------------------------------------------------------------------- */
    .regulations-main-v2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 25px;
    }

    .introduction-card {
        grid-column: 1 / -1;
        background: var(--card-white);
        border: 1px solid #e0e6ed;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
        color: var(--color-primary);
        box-shadow: 0 4px 15px var(--color-shadow);
    }
    .introduction-card i {
        font-size: 24px;
    }
    .introduction-card p {
        margin: 0;
        color: var(--color-text);
        font-weight: 500;
    }

    .regulation-card {
      background: var(--card-white);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 8px 25px var(--color-shadow);
      border-left: 5px solid var(--color-primary); /* Green highlight */
      transition: border-left 0.3s, transform 0.3s ease;
    }

    .regulation-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px var(--color-shadow);
    }

    .violation-card {
        border-left-color: #e74c3c; /* Red highlight for violations */
    }

    .regulation-card h2 {
      margin-bottom: 15px;
      color: var(--color-text);
      font-size: 22px;
      font-weight: 700;
      border-bottom: 2px solid #ecf0f1; /* Border nhẹ */
      padding-bottom: 10px;
    }

    .icon-accent {
        color: var(--color-primary);
        margin-right: 10px;
    }
    /* Chỉnh icon Gavel trong thẻ violation */
    .violation-card h2 .icon-accent {
         color: var(--color-gold); /* Đổi màu icon Gavel sang Navy đậm */
    }

    .regulation-card p {
        color: var(--color-text-sub);
        margin-bottom: 20px;
    }
    
    .regulation-list {
      padding: 0;
      list-style: none;
      color: var(--color-text);
      line-height: 1.8;
      font-size: 15px;
    }

    .regulation-list li {
      margin-bottom: 10px;
      display: flex;
      align-items: flex-start;
    }

    .list-check, .list-danger {
        font-size: 14px;
        margin-right: 10px;
        margin-top: 3px;
        flex-shrink: 0;
    }

    .list-check {
        color: var(--color-primary); /* Green Accent */
    }
    
    .list-danger {
        color: #e74c3c; /* Pomegranate Red */
    }

    /* Responsive */
    @media (max-width: 1050px) {
        .regulations-main-v2 {
            grid-template-columns: 1fr;
        }
        .header-title-content {
            text-align: left;
            margin-left: 0;
        }
        .regulations-header-v2 {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
    }

    @media (max-width: 600px) {
      .regulations-container-v2 {
        padding: 20px 10px;
      }
      .regulations-header-v2 h1 {
        font-size: 24px;
      }
      .regulation-card {
        padding: 20px;
      }
    }
  `]
})
export class LibraryRegulationsComponent {
  constructor(public router: Router) {}
}
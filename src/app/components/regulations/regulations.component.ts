import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-library-regulations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="regulations-container">
      <div class="regulations-wrapper">
        <!-- Header -->
        <header class="regulations-header">
          <h1>Quy định sử dụng Thư viện</h1>
          <button class="back-btn" (click)="router.navigate(['/'])">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
        </header>

        <!-- Content -->
        <main class="regulations-main">
          <!-- 1. Quy định chung -->
          <section>
            <h2>1. Quy định chung</h2>
            <p>Khi sử dụng hệ thống mượn phòng, người dùng cần tuân thủ các quy định sau:</p>
            <ol type="a">
              <li>Đăng nhập bằng tài khoản hợp lệ do nhà trường cấp.</li>
              <li>Chỉ mượn phòng theo thời gian đã đăng ký; không chiếm dụng phòng khi chưa đến lượt.</li>
              <li>Giữ trật tự, vệ sinh trong phòng và khu vực xung quanh.</li>
              <li>Không mang đồ ăn, nước uống (không đóng chai) vào phòng.</li>
              <li>Không phá hỏng hoặc di chuyển thiết bị, bàn ghế trong phòng.</li>
              <li>Chỉ sử dụng phòng cho mục đích học tập, họp nhóm; không tổ chức sự kiện hay mục đích cá nhân khác.</li>
            </ol>
          </section>

          <!-- 2. Đăng ký mượn phòng -->
          <section>
            <h2>2. Đăng ký mượn phòng</h2>
            <ol type="a">
              <li>Người dùng phải đăng ký trực tuyến qua hệ thống.</li>
              <li>Thời gian mỗi lượt mượn: tối đa 120 phút; có thể gia hạn nếu không có người chờ.</li>
              <li>Hủy đăng ký trước ít nhất 15 phút nếu không sử dụng.</li>
              <li>Hệ thống ưu tiên theo thứ tự đăng ký; không được đăng ký trùng phòng cùng khung giờ với người khác.</li>
            </ol>
          </section>

          <!-- 3. Sử dụng và trả phòng -->
          <section>
            <h2>3. Sử dụng và trả phòng</h2>
            <ol type="a">
              <li>Đi vào phòng đúng giờ đã đăng ký và ra khỏi phòng khi kết thúc giờ mượn.</li>
              <li>Bàn ghế, thiết bị phải để gọn gàng, nguyên trạng trước khi rời phòng.</li>
              <li>Báo ngay cho quản lý nếu phát hiện hư hỏng hoặc thiếu thiết bị trong phòng.</li>
              <li>Người mượn chịu trách nhiệm nếu làm hư hỏng tài sản của thư viện.</li>
            </ol>
          </section>

          <!-- 4. Xử lý vi phạm -->
          <section>
            <h2>4. Xử lý vi phạm</h2>
            <ol type="a">
              <li>Đối với việc chiếm dụng phòng quá giờ, hệ thống sẽ tự động khóa lượt mượn tiếp theo của người dùng.</li>
              <li>Hư hỏng thiết bị, nội thất: người mượn phải đền bù theo quy định của thư viện.</li>
              <li>Vi phạm các quy định khác: cảnh cáo, khóa tài khoản tạm thời hoặc vĩnh viễn tùy mức độ.</li>
            </ol>
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Container chính */
    .regulations-container {
      font-family: 'Inter', sans-serif;
      background: #f5f7fa;
      color: #263238;
      min-height: 100vh;
      padding: 50px 20px;
      display: flex;
      justify-content: center; /* căn giữa */
    }

    .regulations-wrapper {
      width: 100%;
      max-width: 900px; /* khung chính giữa */
    }

    /* Header */
    .regulations-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #3f51b5, #2196f3);
      padding: 20px 25px;
      border-radius: 12px;
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .regulations-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }

    .back-btn {
      background: #f44336;
      border: none;
      color: white;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
    }
    .back-btn:hover { background: #d32f2f; }

    /* Main Content */
    .regulations-main section {
      margin-bottom: 25px;
      background: #ffffff;
      padding: 25px 30px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.05);
      transition: transform 0.3s ease;
    }
    .regulations-main section:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(0,0,0,0.08);
    }

    .regulations-main h2 {
      margin-bottom: 15px;
      color: #1a237e;
      font-size: 20px;
      font-weight: 700;
    }

    .regulations-main ol {
      padding-left: 20px;
      color: #607d8b;
      font-size: 14px;
      line-height: 1.6;
    }

    .regulations-main ol li {
      margin-bottom: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .regulations-wrapper {
        padding: 0 15px;
      }
      .regulations-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
    }
  `]
})
export class LibraryRegulationsComponent {
  constructor(public router: Router) {}
}

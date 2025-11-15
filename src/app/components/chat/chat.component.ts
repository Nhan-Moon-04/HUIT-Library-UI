import { Component, signal, inject, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { AuthService } from '../../services/auth.service';

interface Message {
  maTinNhan: number | null;
  maPhienChat: number;
  maNguoiGui: number | null;
  noiDung: string;
  thoiGianGui?: string;
  laBot?: boolean;
}

interface ChatSession {
  maPhienChat: number;
  maNguoiDung?: number;
  maNhanVien?: number | null;
  coBot: boolean;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string | null;
  soLuongTinNhan?: number;
  tinNhanCuoi?: string | null;
  thoiGianTinNhanCuoi?: string | null;
  loaiPhien?: string;
  isActive?: boolean;
  thoiGianTao?: string; // Backward compatibility
  trangThai?: string; // Backward compatibility
}

interface MessageResponse {
  success?: boolean;
  data?: {
    messages: Message[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  message?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  private chatService = inject(ChatService);
  public auth = inject(AuthService); // Make public for template access
  private router = inject(Router);

  isOpen = signal(false);
  draft = signal('');
  messages = signal<Message[]>([]);
  maPhienChat = signal<number>(0);
  isStaffMode = signal(false); // true = chat với nhân viên, false = chat với bot
  chatSessions = signal<ChatSession[]>([]);
  allStaffSessions = signal<ChatSession[]>([]);
  showSessionList = signal(false);
  currentSession = signal<ChatSession | null>(null);
  isLoadingHistory = signal(false);
  currentPage = signal(1);
  hasMoreMessages = signal(false);
  showHistoryModal = signal(false);

  @ViewChild('chatBody') private chatBodyRef!: ElementRef<HTMLDivElement>;

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  toggleMode(): void {
    const newMode = !this.isStaffMode();
    this.isStaffMode.set(newMode);

    // Clear current state
    this.messages.set([]);
    this.maPhienChat.set(0);
    this.currentSession.set(null);
    this.showSessionList.set(false);

    if (newMode) {
      // Chuyển sang chat với nhân viên
      this.loadStaffSessions();
    } else {
      // Chuyển về chat với bot
      this.loadLatestSession();
    }
  }

  toggleSessionList(): void {
    this.showSessionList.set(!this.showSessionList());
    if (this.showSessionList() && this.isStaffMode()) {
      this.loadAllStaffSessions();
    }
  }

  selectSession(session: ChatSession): void {
    this.currentSession.set(session);
    this.maPhienChat.set(session.maPhienChat);
    this.loadSessionMessages(session.maPhienChat);
    this.showSessionList.set(false);
  }

  createNewStaffSession(): void {
    if (!this.auth.isLoggedIn()) {
      alert('Bạn cần đăng nhập để chat với nhân viên');
      return;
    }

    this.chatService.createStaffSession().subscribe({
      next: (res) => {
        if (res?.maPhienChat) {
          const newSession: ChatSession = {
            maPhienChat: res.maPhienChat,
            coBot: res.coBot || false,
            thoiGianTao: new Date().toISOString(),
          };

          this.currentSession.set(newSession);
          this.maPhienChat.set(res.maPhienChat);
          this.messages.set([]);
          this.showSessionList.set(false);

          // Thêm tin nhắn chào mừng
          const welcomeMsg: Message = {
            maTinNhan: null,
            maPhienChat: res.maPhienChat,
            maNguoiGui: null,
            noiDung:
              res.message ||
              'Phiên chat với nhân viên đã được tạo. Nhân viên sẽ phản hồi sớm nhất có thể.',
            laBot: false,
          };
          this.messages.set([welcomeMsg]);

          // Cập nhật danh sách session
          this.chatSessions.set([newSession]);

          // Refresh toàn bộ danh sách phiên chat nếu đang hiển thị
          if (this.showSessionList()) {
            this.loadAllStaffSessions();
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi tạo phiên chat:', err);
        alert('Không thể tạo phiên chat. Vui lòng thử lại.');
      },
    });
  }

  private loadAllStaffSessions(): void {
    if (!this.auth.isLoggedIn()) return;

    this.chatService.getAllStaffSessions().subscribe({
      next: (res) => {
        if (res?.success && res?.data?.sessions) {
          const sessions = res.data.sessions.map((s: any) => ({
            maPhienChat: s.maPhienChat,
            maNguoiDung: s.maNguoiDung,
            maNhanVien: s.maNhanVien,
            coBot: s.coBot || false,
            thoiGianBatDau: s.thoiGianBatDau,
            thoiGianKetThuc: s.thoiGianKetThuc,
            soLuongTinNhan: s.soLuongTinNhan || 0,
            tinNhanCuoi: s.tinNhanCuoi,
            thoiGianTinNhanCuoi: s.thoiGianTinNhanCuoi,
            loaiPhien: s.loaiPhien,
            isActive: s.isActive,
            thoiGianTao: s.thoiGianBatDau, // Backward compatibility
            trangThai: s.isActive ? 'active' : 'inactive',
          }));

          // Sắp xếp theo thời gian bắt đầu (mới nhất trước)
          sessions.sort((a: ChatSession, b: ChatSession) => {
            const timeA = new Date(a.thoiGianBatDau || '').getTime();
            const timeB = new Date(b.thoiGianBatDau || '').getTime();
            return timeB - timeA;
          });

          this.allStaffSessions.set(sessions);
          this.chatSessions.set(sessions);
        } else {
          this.allStaffSessions.set([]);
          this.chatSessions.set([]);
        }
      },
      error: (err) => {
        console.error('Lỗi khi load toàn bộ phiên chat:', err);
        this.allStaffSessions.set([]);
        this.chatSessions.set([]);
      },
    });
  }

  private loadStaffSessions(): void {
    if (!this.auth.isLoggedIn()) return;

    // Sử dụng endpoint mới để load phiên chat nhân viên mới nhất cùng tin nhắn
    this.chatService.getLatestStaffSessionWithMessages().subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          const data = res.data;

          if (data.sessionInfo) {
            const sessionInfo = data.sessionInfo;

            // Tạo session object
            const currentSession = {
              maPhienChat: sessionInfo.maPhienChat,
              coBot: sessionInfo.coBot || false,
              thoiGianTao: sessionInfo.thoiGianBatDau,
              trangThai: sessionInfo.isActive ? 'active' : 'inactive',
            };

            // Set session hiện tại
            this.currentSession.set(currentSession);
            this.maPhienChat.set(sessionInfo.maPhienChat);
            this.chatSessions.set([currentSession]);

            // Load tin nhắn
            if (data.messages && Array.isArray(data.messages)) {
              const mapped = data.messages.map((m: any) => ({
                maTinNhan: m.maTinNhan,
                maPhienChat: m.maPhienChat,
                maNguoiGui: m.maNguoiGui,
                noiDung: m.noiDung,
                thoiGianGui: m.thoiGianGui,
                laBot: !!m.laBot,
              }));

              // Sắp xếp theo thời gian
              mapped.sort(
                (a: any, b: any) =>
                  new Date(a.thoiGianGui || '').getTime() - new Date(b.thoiGianGui || '').getTime()
              );

              this.messages.set(mapped);
            } else {
              this.messages.set([]);
            }
          } else if (!res.isNewSession) {
            // Không có phiên chat nào, tạo phiên mới
            this.createNewStaffSession();
          }
        } else {
          // Fallback: tạo phiên mới nếu không có dữ liệu
          this.createNewStaffSession();
        }
      },
      error: (err) => {
        console.error('Lỗi khi load phiên chat nhân viên:', err);
        // Fallback: tạo phiên mới
        this.createNewStaffSession();
      },
    });
  }

  private loadSessionMessages(maPhienChat: number): void {
    this.chatService.getSessionMessagesWithPagination(maPhienChat, 1, 50).subscribe({
      next: (res: MessageResponse) => {
        if (res?.success && res?.data?.messages) {
          const mapped = res.data.messages.map((m: any) => ({
            maTinNhan: m.maTinNhan,
            maPhienChat: m.maPhienChat,
            maNguoiGui: m.maNguoiGui,
            noiDung: m.noiDung,
            thoiGianGui: m.thoiGianGui,
            laBot: !!m.laBot,
          }));

          // Sắp xếp theo thời gian
          if (mapped.some((x: any) => x.thoiGianGui)) {
            mapped.sort(
              (a: any, b: any) =>
                new Date(a.thoiGianGui).getTime() - new Date(b.thoiGianGui).getTime()
            );
          }

          this.messages.set(mapped);
          this.currentPage.set(res.data.page);
          this.hasMoreMessages.set(res.data.hasMore);
        } else if (res && Array.isArray(res)) {
          // Fallback cho format cũ
          const mapped = res.map((m: any) => ({
            maTinNhan: m.maTinNhan,
            maPhienChat: m.maPhienChat,
            maNguoiGui: m.maNguoiGui,
            noiDung: m.noiDung,
            thoiGianGui: m.thoiGianGui,
            laBot: !!m.laBot,
          }));

          if (mapped.some((x: any) => x.thoiGianGui)) {
            mapped.sort(
              (a: any, b: any) =>
                new Date(a.thoiGianGui).getTime() - new Date(b.thoiGianGui).getTime()
            );
          }

          this.messages.set(mapped);
        }
      },
      error: (err) => {
        console.error('Lỗi khi load tin nhắn:', err);
      },
    });
  }

  send(): void {
    const text = this.draft();
    if (!text?.trim()) return;

    const session = this.maPhienChat();
    if (!session) {
      if (this.isStaffMode()) {
        this.createNewStaffSession();
        return;
      }
    }

    // Push user message locally
    const userMsg: Message = {
      maTinNhan: null,
      maPhienChat: session,
      maNguoiGui: this.auth.currentUser()?.maNguoiDung ?? null,
      noiDung: text,
      laBot: false,
    };
    this.messages.set([...this.messages(), userMsg]);
    this.draft.set('');

    // Gửi tin nhắn tùy theo chế độ
    const sendObservable = this.isStaffMode()
      ? this.chatService.sendMessageToStaff(session, text)
      : this.chatService.sendMessage(session, text);

    sendObservable.subscribe({
      next: (res) => {
        if (this.isStaffMode()) {
          // Với staff mode, chỉ cần confirm tin nhắn đã gửi thành công
          // Phản hồi từ nhân viên sẽ được load qua polling hoặc real-time
          console.log('Tin nhắn đã gửi:', res);
        } else {
          // Bot mode - nhận phản hồi ngay lập tức
          if (res?.botMessage) {
            const bot = res.botMessage;
            const botMsg: Message = {
              maTinNhan: bot.maTinNhan,
              maPhienChat: bot.maPhienChat,
              maNguoiGui: bot.maNguoiGui,
              noiDung: bot.noiDung,
              thoiGianGui: bot.thoiGianGui,
              laBot: true,
            };
            this.messages.set([...this.messages(), botMsg]);
          }
        }
      },
      error: (err) => {
        console.error('Lỗi khi gửi tin nhắn:', err);
        const errorMsg: Message = {
          maTinNhan: null,
          maPhienChat: session,
          maNguoiGui: null,
          noiDung: 'Đã có lỗi khi gửi tin nhắn. Vui lòng thử lại.',
          laBot: this.isStaffMode() ? false : true,
        };
        this.messages.set([...this.messages(), errorMsg]);
      },
    });
  }

  // Auto-open after login
  constructor() {
    // Initial load (works for anonymous or already-logged-in users)
    this.loadLatestSession();

    // React to login/logout changes so chat updates immediately without page reload
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();
      if (loggedIn) {
        // user just logged in -> reload latest session & messages
        if (this.isStaffMode()) {
          this.loadStaffSessions();
        } else {
          this.loadLatestSession();
        }
      } else {
        // user logged out -> clear messages and reset session id
        this.messages.set([]);
        this.maPhienChat.set(0);
        this.currentSession.set(null);
        this.chatSessions.set([]);
        this.isStaffMode.set(false); // Reset về bot mode
        if (!this.isPageMode()) {
          this.isOpen.set(false);
        }
      }
    });

    // Auto-scroll when messages change
    effect(() => {
      // read messages signal to track changes
      this.messages();
      // only scroll automatically if panel is open or in page mode
      if (this.isOpen() || this.isPageMode()) {
        // scroll to bottom after DOM updates
        this.scrollToBottom();
      }
    });

    // When user opens the chat panel, ensure we scroll to the latest messages
    effect(() => {
      if (this.isOpen() || this.isPageMode()) {
        // wait a tick so the chatBody ViewChild is available
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  private loadLatestSession(): void {
    this.chatService.getLatestSessionWithMessages().subscribe({
      next: (res) => {
        const data = res?.data;
        if (data?.sessionInfo) {
          const s = data.sessionInfo;
          this.maPhienChat.set(s.maPhienChat);

          // Map messages returned by server. If none and server created a new session, keep the welcome.
          if (Array.isArray(data.messages) && data.messages.length) {
            const mapped = data.messages.map((m: any) => ({
              maTinNhan: m.maTinNhan,
              maPhienChat: m.maPhienChat,
              maNguoiGui: m.maNguoiGui,
              noiDung: m.noiDung,
              thoiGianGui: m.thoiGianGui,
              laBot: !!m.laBot,
            }));
            // Prefer sorting by timestamp when available (old -> new)
            if (mapped.some((x: any) => x.thoiGianGui)) {
              mapped.sort(
                (a: any, b: any) =>
                  new Date(a.thoiGianGui).getTime() - new Date(b.thoiGianGui).getTime()
              );
            } else if (mapped.every((x: any) => typeof x.maTinNhan === 'number')) {
              // If no timestamp, try sorting by message id (ascending)
              mapped.sort((a: any, b: any) => (a.maTinNhan || 0) - (b.maTinNhan || 0));
            }
            this.messages.set(mapped);
          } else if (res?.isNewSession && data.messages && data.messages.length === 0) {
            const serverMsg = res?.message || 'Xin chào! Tôi có thể giúp gì cho bạn?';
            this.messages.set([
              {
                maTinNhan: null,
                maPhienChat: s.maPhienChat,
                maNguoiGui: 0,
                noiDung: serverMsg,
                laBot: true,
              },
            ]);
          }

          // Open if the session is active or user logged in or in page mode
          if (s.isActive || this.auth.isLoggedIn() || this.isPageMode()) {
            this.isOpen.set(true);
          }
        } else {
          if (this.auth.isLoggedIn() || this.isPageMode()) {
            this.isOpen.set(true);
          }
        }
      },
      error: () => {
        if (this.auth.isLoggedIn() || this.isPageMode()) {
          this.isOpen.set(true);
        }
      },
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatBodyRef?.nativeElement;
      if (!el) return;
      // ensure this runs after DOM update
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 0);
    } catch (e) {
      // ignore
    }
  }

  formatTime(timeString?: string): string {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  }

  formatDate(timeString?: string): string {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return '';
    }
  }

  isPageMode(): boolean {
    // Kiểm tra xem đang ở chế độ trang độc lập hay widget
    return this.router.url === '/chat';
  }

  // Hiển thị modal lịch sử tin nhắn
  showMessageHistory(): void {
    if (!this.currentSession()) {
      alert('Không có phiên chat nào để xem lịch sử');
      return;
    }
    this.showHistoryModal.set(true);
    this.loadMessageHistory(1);
  }

  // Đóng modal lịch sử
  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
    this.currentPage.set(1);
  }

  // Load lịch sử tin nhắn với pagination
  loadMessageHistory(page: number = 1, pageSize: number = 20): void {
    const session = this.currentSession();
    if (!session) return;

    this.isLoadingHistory.set(true);
    this.chatService
      .getSessionMessagesWithPagination(session.maPhienChat, page, pageSize)
      .subscribe({
        next: (res: MessageResponse) => {
          this.isLoadingHistory.set(false);

          if (res?.success && res?.data?.messages) {
            const mapped = res.data.messages.map((m: any) => ({
              maTinNhan: m.maTinNhan,
              maPhienChat: m.maPhienChat,
              maNguoiGui: m.maNguoiGui,
              noiDung: m.noiDung,
              thoiGianGui: m.thoiGianGui,
              laBot: !!m.laBot,
            }));

            // Sắp xếp theo thời gian (cũ nhất trước)
            mapped.sort(
              (a: any, b: any) =>
                new Date(a.thoiGianGui || '').getTime() - new Date(b.thoiGianGui || '').getTime()
            );

            if (page === 1) {
              // Trang đầu tiên - thay thế toàn bộ
              this.messages.set(mapped);
            } else {
              // Trang tiếp theo - thêm vào đầu danh sách (tin nhắn cũ hơn)
              this.messages.set([...mapped, ...this.messages()]);
            }

            this.currentPage.set(res.data.page);
            this.hasMoreMessages.set(res.data.hasMore);
          }
        },
        error: (err) => {
          this.isLoadingHistory.set(false);
          console.error('Lỗi khi load lịch sử tin nhắn:', err);
          alert('Không thể tải lịch sử tin nhắn. Vui lòng thử lại.');
        },
      });
  }

  // Load thêm tin nhắn cũ hơn
  loadMoreHistory(): void {
    if (!this.hasMoreMessages() || this.isLoadingHistory()) return;
    this.loadMessageHistory(this.currentPage() + 1);
  }

  // Kiểm tra tin nhắn có phải của user hiện tại không
  isCurrentUserMessage(message: Message): boolean {
    const currentUserId = this.auth.currentUser()?.maNguoiDung;
    return message.maNguoiGui === currentUserId;
  }

  // TrackBy function để tối ưu hiệu suất render
  trackByMessageId(index: number, message: Message): any {
    return message.maTinNhan || index;
  }
}

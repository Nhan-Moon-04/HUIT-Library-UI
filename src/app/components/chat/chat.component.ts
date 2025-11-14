import { Component, signal, inject, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  private chatService = inject(ChatService);
  private auth = inject(AuthService);

  isOpen = signal(false);
  draft = signal('');
  messages = signal<Message[]>([]);
  // Use a single session id per user (or 0 for anonymous). We'll generate a small random id for demo if not logged in.
  maPhienChat = signal<number>(Math.floor(Math.random() * 100000));
  @ViewChild('chatBody') private chatBodyRef!: ElementRef<HTMLDivElement>;

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  send(): void {
    const text = this.draft();
    if (!text?.trim()) return;

    const session = this.maPhienChat();
    // push user message locally
    const userMsg: Message = {
      maTinNhan: null,
      maPhienChat: session,
      maNguoiGui: this.auth.currentUser()?.maNguoiDung ?? null,
      noiDung: text,
      laBot: false,
    };
    this.messages.set([...this.messages(), userMsg]);
    this.draft.set('');

    // Call API
    this.chatService.sendMessage(session, text).subscribe({
      next: (res) => {
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
      },
      error: (err) => {
        const botMsg: Message = {
          maTinNhan: null,
          maPhienChat: session,
          maNguoiGui: null,
          noiDung: 'Đã có lỗi khi gửi tin nhắn. Vui lòng thử lại.',
          laBot: true,
        };
        this.messages.set([...this.messages(), botMsg]);
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
        this.loadLatestSession();
      } else {
        // user logged out -> clear messages and reset session id
        this.messages.set([]);
        this.maPhienChat.set(Math.floor(Math.random() * 100000));
        this.isOpen.set(false);
      }
    });

    // Auto-scroll when messages change
    effect(() => {
      // read messages signal to track changes
      this.messages();
      // only scroll automatically if panel is open
      if (this.isOpen()) {
        // scroll to bottom after DOM updates
        this.scrollToBottom();
      }
    });

    // When user opens the chat panel, ensure we scroll to the latest messages
    effect(() => {
      if (this.isOpen()) {
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

          // Open if the session is active or user logged in
          if (s.isActive || this.auth.isLoggedIn()) this.isOpen.set(true);
        } else {
          if (this.auth.isLoggedIn()) this.isOpen.set(true);
        }
      },
      error: () => {
        if (this.auth.isLoggedIn()) this.isOpen.set(true);
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
}

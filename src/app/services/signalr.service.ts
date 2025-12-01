import { Injectable, inject, effect } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface MessageData {
  maTinNhan: number;
  maPhienChat: number;
  maNguoiGui: number | null;
  tenNguoiGui: string;
  noiDung: string;
  thoiGianGui: string;
  laBot: boolean;
  messageType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private auth = inject(AuthService);
  private hubConnection: HubConnection | null = null;
  private connectionState = new BehaviorSubject<boolean>(false);
  private messageReceived = new BehaviorSubject<MessageData | null>(null);

  public connectionState$ = this.connectionState.asObservable();
  public messageReceived$ = this.messageReceived.asObservable();

  constructor() {
    // Auto connect when user is logged in using effect for signal
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private async connect(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      return;
    }

    const token = this.auth.getToken();
    if (!token) {
      console.log('No token found, cannot connect to SignalR');
      return;
    }

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${environment.appUrl}/chatHub`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      await this.hubConnection.start();
      console.log('✅ SignalR Connected');
      this.connectionState.next(true);

      // Note: Group joining is handled automatically by backend
      // Backend joins users to appropriate groups based on JWT token
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      this.connectionState.next(false);
    }
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Handle incoming messages
    this.hubConnection.on('ReceiveMessage', (messageData: MessageData) => {
      console.log('Received message via SignalR:', messageData);
      this.messageReceived.next(messageData);
    });

    // Handle connection events
    this.hubConnection.onclose((error?: Error) => {
      console.log('SignalR connection closed:', error);
      this.connectionState.next(false);
    });

    this.hubConnection.onreconnecting((error?: Error) => {
      console.log('SignalR reconnecting:', error);
      this.connectionState.next(false);
    });

    this.hubConnection.onreconnected((connectionId?: string) => {
      console.log('✅ SignalR reconnected:', connectionId);
      this.connectionState.next(true);

      // Groups are automatically rejoined by backend on reconnection
    });
  }

  public async disconnect(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR Disconnected');
      } catch (error) {
        console.error('Error disconnecting from SignalR:', error);
      } finally {
        this.hubConnection = null;
        this.connectionState.next(false);
      }
    }
  }

  public async joinChatSession(chatSessionId: number): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('JoinChatSession', chatSessionId.toString());
        console.log(`Joined chat session: ${chatSessionId}`);
      } catch (error) {
        console.error('Error joining chat session:', error);
      }
    }
  }

  public async leaveChatSession(chatSessionId: number): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('LeaveChatSession', chatSessionId.toString());
        console.log(`Left chat session: ${chatSessionId}`);
      } catch (error) {
        console.error('Error leaving chat session:', error);
      }
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  public getConnectionId(): string | null {
    return this.hubConnection?.connectionId || null;
  }
}

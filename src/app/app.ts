import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent],
  template: `<router-outlet></router-outlet><app-chat></app-chat>`,
})
export class App {
  protected readonly title = signal('HUIT-Library-UI');
}

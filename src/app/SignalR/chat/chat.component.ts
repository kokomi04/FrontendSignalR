import { Component } from '@angular/core';
import { SignalrService } from '../signalr.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  public messages: {user: number, message: string}[] = [];
  orderId: number = 0;
  newOrderId: number = 0;
  userId: number = 0; 
  newMessage: string = '';

  constructor(private signalRService: SignalrService) { }

  ngOnInit() {
    this.signalRService.startConnection();
    this.signalRService.getConnectionStatus()
      .pipe(filter(connected => connected), take(1))
      .subscribe(() => {
        this.signalRService.joinGroup(this.orderId);
        this.signalRService.addReceiveMessageListener((user, message) => {
          this.messages.push({ user, message });
        });
      });
  }

  sendMessage() {
    this.signalRService.sendMessage(this.orderId, this.userId, this.newMessage);
    this.newMessage = '';
  }

  onChangeGroup() {
    this.signalRService.leaveGroup(this.orderId)
    this.orderId = this.newOrderId;
    this.signalRService.joinGroup(this.orderId);
  }

}

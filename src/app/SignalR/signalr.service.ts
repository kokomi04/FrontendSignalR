import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: HubConnection;
  private connectionEstablished = new BehaviorSubject<boolean>(false);
  
  constructor() { }


  public startConnection() {
    this.hubConnection = this.getConnection();
    
    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.connectionEstablished.next(true);
      })
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  private getConnection(): HubConnection {
    return this.hubConnection = new HubConnectionBuilder()
    .withUrl('https://localhost:7054/chathub')
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds(retryContext) {
        console.log(retryContext.elapsedMilliseconds)
        if (retryContext.elapsedMilliseconds < 15000) {
          return 2000;
        } else {
          return 10000;
        }
      },
    })
    .build();
  }

  public addReceiveMessageListener(callback: (user: number, message: string) => void) {
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      callback(user, message);
    });
  }


  public sendMessage(orderId: number, userId: number, message: string) {
    this.hubConnection.invoke('SendMessageToGroup', orderId, userId, message)
      .catch(err => console.error(err));
  }

  public joinGroup(orderId: number) {
    this.hubConnection.invoke('AddToGroup', orderId)
      .catch(err => console.error(err));
  }

  public leaveGroup(orderId: number) {
    this.hubConnection.invoke('RemoveFromGroup', orderId)
      .catch(err => console.error(err));
  }

  public getHubConnection(): HubConnection {
    return this.hubConnection;
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.connectionEstablished.asObservable();
  }

}

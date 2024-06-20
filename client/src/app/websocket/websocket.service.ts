import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { Message } from '../message/message.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private sockets: { [key: string]: WebSocketSubject<any> } = {};
  private messageSubjects: { [key: string]: Subject<Message> } = {};

  constructor(private cookieService: CookieService) {}

  public connect(roomName: string): void {
    if (!this.sockets[roomName] || this.sockets[roomName].closed) {
      const token = this.cookieService.get('access_token'); // Retrieve token from cookies

      this.sockets[roomName] = webSocket({
        url: `${environment.wsUrl}ws/chat/${roomName}/?token=${token}`, // Include the token in the query parameters
        openObserver: {
          next: () => {
            console.log(`WebSocket connection established for room ${roomName}`);
          }
        },
        closeObserver: {
          next: () => {
            console.log(`WebSocket connection closed for room ${roomName}`);
            delete this.sockets[roomName]; // Remove the socket from the list when closed
            delete this.messageSubjects[roomName]; // Remove the subject when the socket is closed
          }
        }
      });

      this.messageSubjects[roomName] = new Subject<Message>();

      this.sockets[roomName].subscribe(
        (message: any) => this.messageSubjects[roomName].next(message.message),
        (err) => console.error(`Error in WebSocket for room ${roomName}:`, err)
      );
    }
  }

  public disconnect(roomName: string): void {
    if (this.sockets[roomName]) {
      this.sockets[roomName].complete();
    }
  }

  public sendMessage(roomName: string, message: any): void {
    if (this.sockets[roomName]) {
      this.sockets[roomName].next(message);
    }
  }

  public onMessage(roomName: string): Observable<Message> {
    if (!this.messageSubjects[roomName]) {
      this.messageSubjects[roomName] = new Subject<Message>();
    }
    return this.messageSubjects[roomName].asObservable();
  }
}
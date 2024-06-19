import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;

  constructor() {}

  public connect(roomName: string): WebSocketSubject<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(environment.wsUrl + `ws/chat/${roomName}/`);
    }
    return this.socket$;
  }

  public disconnect() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  public sendMessage(message: any) {
    if (this.socket$) {
      this.socket$.next(message);
    }
  }

  public onMessage(): Observable<any> {
    return this.socket$.asObservable();
  }
}

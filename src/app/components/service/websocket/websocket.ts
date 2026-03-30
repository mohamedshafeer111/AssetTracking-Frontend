import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class Websocket {


  private socket$!: WebSocketSubject<any>; // ✅ fixed
  private zoneCountSubject = new Subject<any>();
  zoneCount$ = this.zoneCountSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  private connect() {
//  this.socket$ = webSocket('ws://172.16.100.29:5202/ws/ZoneCount');
  this.socket$ = webSocket('wss://phcc.purpleiq.ai/ws/ZoneCount');

    this.socket$.subscribe({
      next: (message) => {
        this.ngZone.run(() => {
          this.zoneCountSubject.next(message);
        });
      },
      error: (err) => console.error('❌ WebSocket Error:', err),
      complete: () => console.warn('⚠️ WebSocket closed')
    });
  }

  disconnect() {
    this.socket$?.complete();
  }
  
}

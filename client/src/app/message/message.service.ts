import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';
import { environment } from '../../environments/environment';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = environment.apiUrl + 'messages/';
  private conversationsUrl = environment.apiUrl + 'conversations/';

  private messages = new BehaviorSubject<Message[]>([]);
  messages$ = this.messages.asObservable();

  private conversations = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversations.asObservable();

  private selectedConversation = new BehaviorSubject<Conversation | null>(null);
  selectedConversation$ = this.selectedConversation.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cookieService: CookieService
  ) {}

  getMessages(conversationId: string | undefined): void {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    this.http
      .get<Message[]>(`${this.apiUrl}?conversation=${conversationId}`)
      .pipe(
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      )
      .subscribe((messages) => {
        this.messages.next(messages);
      });
  }

  setSelectedConversation(conversation: Conversation): void {
    this.selectedConversation.next(conversation);
    this.getMessages(conversation.id);
  }

  createMessage(message: Message): Observable<Message> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });

    const conversationId = this.cookieService.get('conversation_id');
    if (conversationId) {
      message.conversation_id = conversationId;
    }

    return this.http.post<Message>(this.apiUrl, message).pipe(
      tap((response: Message) => {
        this.showNotification('Message created successfully');
        this.cookieService.set('conversation_id', response.conversation_id);
      }),
      catchError(this.handleError),
      finalize(() => {
        dialogRef.close();
        if (message.conversation_id) {
          this.getMessages(message.conversation_id);
        }
      })
    );
  }

  updateMessage(id: string, message: Message): Observable<Message> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http.put<Message>(`${this.apiUrl}${id}/`, message).pipe(
      tap(() => this.showNotification('Message updated successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  deleteMessage(id: string): Observable<void> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.showNotification('Message deleted successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  getUserConversations(): void {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    this.http
      .get<Conversation[]>(`${this.conversationsUrl}my_conversations/`)
      .pipe(
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      )
      .subscribe((conversations) => {
        this.conversations.next(conversations);
      });
  }

  getConversations(): Observable<Conversation[]> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http.get<Conversation[]>(this.conversationsUrl).pipe(
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  createConversation(participants: string[]): Observable<Conversation> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http
      .post<Conversation>(this.conversationsUrl, { participants })
      .pipe(
        tap(() => this.showNotification('Conversation created successfully')),
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      );
  }

  handleIncomingMessage(message: Message) {
    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, message]);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '600px',
      data: { message: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Message created', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  openEditDialog(message: Message): void {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '600px',
      data: { message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && message.id) {
        this.snackBar.open('Message updated', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    this.showNotification('Something went wrong; please try again later.');
    return throwError('Something went wrong; please try again later.');
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}
export interface Message {
  id?: string | null;
  conversation_id: string;
  content: string;
  created_at?: string;
  username?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  phone?: string;
  email_address?: string;
  participants: string[];
  messages: Message[];
  created_at: string;
  updated_at: string;
}

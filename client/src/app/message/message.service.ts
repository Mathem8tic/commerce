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
import { ConversationDialogComponent } from './conversation-dialog/conversation-dialog.component';
import { User } from '../auth/User';
import { AuthService } from '../auth/auth.service';

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
        finalize(() => { dialogRef.close()})
      )
      .subscribe((messages) => {
        this.messages.next(messages);
      });
  }

  setSelectedConversation(conversation: Conversation): void {
    if (this.selectedConversation.getValue()?.id !== conversation.id) {
      this.selectedConversation.next(conversation);
      this.cookieService.set('conversation_id', conversation.id);
      this.getMessages(conversation.id);
    }
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
      .get<Conversation[]>(`${this.conversationsUrl}user_conversations/`)
      .pipe(
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      )
      .subscribe((conversations) => {
        this.conversations.next(conversations);
        const conversationId = this.cookieService.get('conversation_id');
        const selectedConversation = conversations.find(
          (conversation) => conversation.id === conversationId
        );

        if (selectedConversation) {
          this.setSelectedConversation(selectedConversation);
        }
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

  setConversations(conversations: Conversation[]): void {
    this.conversations.next(conversations);
  }

  createConversation(conversationData: string[]): Observable<Conversation> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http
      .post<Conversation>(this.conversationsUrl, conversationData)
      .pipe(
        tap((conversation: Conversation) => {
          this.showNotification('Conversation created successfully');
          this.setSelectedConversation(conversation);
        }),
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      );
  }

  updateConversation(
    id: string,
    conversation: Conversation
  ): Observable<Conversation> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http
      .put<Conversation>(
        `${this.conversationsUrl}${conversation.id}/`,
        conversation
      )
      .pipe(
        tap(() => this.showNotification('Conversation updated successfully')),
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      );
  }

  handleIncomingMessage(message: Message) {
    const currentMessages = this.messages.getValue();
    const messageExists = currentMessages.some((msg) => msg.id === message.id);
    if (!messageExists) {
      this.messages.next([...currentMessages, message]);
    }
  }

  openConversationDialog(
    authService: AuthService,
    user: User,
    conversation?: Conversation,
  ): void {
    const dialogRef = this.dialog.open(ConversationDialogComponent, {
      width: '600px',
      data: { authService, conversation },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (conversation && result.delete) {
          this.removeUserFromConversation(conversation.id, user);
        } else {
          if (conversation) {
            this.updateConversation(conversation.id, result).subscribe(() => {
              this.showNotification('Conversation updated');
              this.getUserConversations();
            });
          } else {
            this.createConversation(result).subscribe(() => {
              this.showNotification('Conversation created');
              this.getUserConversations();
            });
          }
        }
      }
    });
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

  removeUserFromConversation(
    conversationId: string,
    user: User
  ): Observable<Conversation> | boolean {
    return this.http.put<Conversation>(
      `${this.apiUrl}${conversationId}/remove_user/`,
      { userId: user.id }
    );
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

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../auth/User';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConversationDialogComponent } from '../message/conversation-dialog/conversation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Conversation } from './conversation';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private conversationsUrl = environment.apiUrl + 'conversations/';

  private conversations = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversations.asObservable();

  private selectedConversation = new BehaviorSubject<Conversation | null>(null);
  selectedConversation$ = this.selectedConversation.asObservable();

  constructor(
    private cookieService: CookieService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  setSelectedConversation(conversation: Conversation | null): void {
    console.log('this is the conversation coming in:', conversation);
    this.cookieService.delete('conversation_id');
    if (conversation) {
      this.cookieService.set('conversation_id', conversation.id);
    }
    this.selectedConversation.next(conversation);
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
        }),
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      );
  }

  updateConversation(conversation: Conversation): Observable<Conversation> {
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

  removeUserFromConversation(
    conversation: Conversation,
    user: User
  ): Observable<Conversation> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
    return this.http
      .put<Conversation>(
        `${this.conversationsUrl}${conversation.id}/remove_user/`,
        { userId: user.id }
      )
      .pipe(
        tap(() => {
          this.showNotification('Conversation removed successfully');
          this.cookieService.delete('conversation_id');

          const updatedConversations = this.conversations
            .getValue()
            .filter((conv) => conv.id !== conversation.id);
          this.setConversations(updatedConversations);

          if (updatedConversations.length > 0) {
            this.setSelectedConversation(updatedConversations[0]);
          } else {
            this.setSelectedConversation(null);
          }
        }),
        catchError(this.handleError),
        finalize(() => dialogRef.close())
      );
  }

  openConversationDialog(user: User, conversation?: Conversation): void {
    const dialogRef = this.dialog.open(ConversationDialogComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.delete && conversation) {
          this.removeUserFromConversation(conversation, user).subscribe(
            () => {}
          );
        } else {
          if (conversation) {
            this.updateConversation(result).subscribe(() => {
              this.showNotification('Conversation updated');
              this.getUserConversations();
            });
          } else {
            // NEED TO Get this selecting the conversation after create

            this.createConversation(result).subscribe(() => {
              this.showNotification('Conversation created');
              console.log('created conversation:', result);
              this.cookieService.set('conversation_id', result.id);
              this.getUserConversations();
            });
          }
        }
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

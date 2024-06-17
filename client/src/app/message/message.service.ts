import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export interface Message {
  id?: number | undefined;
  title: string;
  content: string;
  phone?: string;
  email_address?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = environment.apiUrl + 'messages/';

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private dialog: MatDialog, private authService: AuthService) {}

  getMessages(): Observable<Message[]> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.get<Message[]>(this.apiUrl).pipe(
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  createMessage(message: Message): Observable<Message> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.post<Message>(this.apiUrl, message).pipe(
      tap(() => this.showNotification('Message created successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  updateMessage(id: number, message: Message): Observable<Message> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.put<Message>(`${this.apiUrl}${id}/`, message).pipe(
      tap(() => this.showNotification('Message updated successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  deleteMessage(id: number): Observable<void> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.showNotification('Message deleted successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
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
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from './User';
import { ConversationService } from '../conversation/conversation.service';

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: {
    id: string;
    username: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
  };
}

interface CustomJwtPayload extends JwtPayload {
  is_staff?: boolean;
  is_user?: boolean;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private conversationService: ConversationService,
    private cookieService: CookieService
  ) {
    const user = this.cookieService.get('user');
    if (user) {
      this.userSubject.next(JSON.parse(user) as User);
    }
  }

  register(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}register/`, data)
      .pipe(catchError(this.handleError));
  }

  login(login: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}token/`, {
        login,
        username: login,
        password,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refresh = this.cookieService.get('refresh_token');
    if (!refresh) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}token/refresh/`, { refresh })
      .pipe(
        tap((response) => {
          console.log('Token refreshed: ', response);
          this.setSession(response);
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
        })
      );
  }

  logout(): void {
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
    this.cookieService.delete('user', '/');
    this.cookieService.delete('conversation_id', '/');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return this.cookieService.get('access_token');
  }

  isAdmin(): boolean {
    const token = this.cookieService.get('access_token');
    if (token) {
      const decoded: CustomJwtPayload = jwtDecode<CustomJwtPayload>(token);
      return !!decoded.is_staff;
    }
    return false;
  }

  isUser(): boolean {
    const token = this.cookieService.get('access_token');
    if (token) {
      const decoded: CustomJwtPayload = jwtDecode<CustomJwtPayload>(token);
      return !!decoded.is_user;
    }
    return false;
  }

  public getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  openRegisterDialog(): void {
    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('User registered successfully');
      }
    });
  }

  private setSession(authResult: AuthResponse): void {
    const expiresIn = 60 * 120; // 1 hour
    this.cookieService.set(
      'access_token',
      authResult.access,
      expiresIn,
      '/',
      undefined,
      true,
      'Strict'
    );
    if (authResult.refresh) {
      this.cookieService.set('refresh_token', authResult.refresh);
    }

    if (authResult.user) {
      this.cookieService.set(
        'user',
        JSON.stringify(authResult.user),
        expiresIn,
        '/',
        undefined,
        true,
        'Strict'
      );
      this.userSubject.next(authResult.user);
    }

    this.conversationService.getUserConversations();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface AuthResponse {
  access: string;
  refresh: string;
}

interface CustomJwtPayload extends JwtPayload {
  is_staff?: boolean;
  is_user?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  register(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}register/`, data)
      .pipe(catchError(this.handleError));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}token/`, { username, password })
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
          this.authState.next(true);
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
        })
      );
  }

  logout(): void {
    this.cookieService.delete('access_token');
    this.cookieService.delete('refresh_token');
    this.authState.next(false);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!this.cookieService.get('access_token');
    }
    return false;
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
    console.log('not admin');
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
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}

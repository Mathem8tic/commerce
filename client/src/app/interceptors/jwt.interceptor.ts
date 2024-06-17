import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class JwtInterceptor {
  private static isRefreshing = false;
  private static refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  static intercept: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const authService = inject(AuthService);
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
      const token = authService.getToken();
      if (token) {
        req = JwtInterceptor.addToken(req, token);
      }

      return next(req).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return JwtInterceptor.handle401Error(req, next, authService);
          } else {
            return throwError(() => error);
          }
        })
      );
    } else {
      return next(req);
    }
  };

  private static addToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private static handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
    if (!JwtInterceptor.isRefreshing) {
      JwtInterceptor.isRefreshing = true;
      JwtInterceptor.refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((token: any) => {
          JwtInterceptor.isRefreshing = false;
          JwtInterceptor.refreshTokenSubject.next(token.access);
          return next(JwtInterceptor.addToken(req, token.access));
        }),
        catchError((err) => {
          JwtInterceptor.isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return JwtInterceptor.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next(JwtInterceptor.addToken(req, jwt));
        })
      );
    }
  }
}
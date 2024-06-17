import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    const token = this.cookieService.get('access_token');
    if (token) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
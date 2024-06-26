import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoginDialogComponent } from './auth/login-dialog/login-dialog.component';
import { MessageListComponent } from './message/message-list/message-list.component';
import { RegisterDialogComponent } from './auth/register-dialog/register-dialog.component';
import { AuthService } from './auth/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MediaMatcher } from '@angular/cdk/layout';
import { MessageDialogComponent } from './message/message-dialog/message-dialog.component';
import { MessageService } from './message/message.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ChatBottomSheetComponent } from './message/chat-bottom-sheet/chat-bottom-sheet.component';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MessageListComponent,
    MatDialogModule,
    RouterModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'client';
  isLoggedIn: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    changeDetectorRef: ChangeDetectorRef,
    private bottomSheet: MatBottomSheet,
    private cookieService: CookieService,
    media: MediaMatcher,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();

    if (this.mobileQuery.addEventListener) {
      this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    } else {
      this.mobileQuery.addListener(this._mobileQueryListener);
    }
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });

    console.log('websocket environment: ', environment.wsUrl);
  }

  log() {
    console.log('websocket environment: ', environment.wsUrl);
  }

  refreshToken() {
    this.authService.refreshToken().subscribe((res) => {});
  }

  openLoginDialog(): void {
    this.dialog.open(LoginDialogComponent, {
      width: '300px',
    });
  }

  openRegisterDialog(): void {
    this.authService.openRegisterDialog();
  }

  openCreateMessageDialog(): void {
    this.messageService.openCreateDialog();
  }

  logout(): void {
    this.authService.logout();
    console.log('User logged out');
  }

  openChat() {
    const conversationId = this.cookieService.get('conversation_id');

    this.bottomSheet.open(ChatBottomSheetComponent, {
      data: { conversationId }
    });
  }

  ngOnDestroy() {}
}

export const treatments = [
  {
    image: 'img/friends-discount-speakers.webp',
    title: 'Speaker Packages',
    subtitle: 'Get that big sound you have been searching for',
    content:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
  },
  {
    image: 'img/friends-discount-old-television.webp',
    title: 'Television Packages',
    subtitle: 'Is it time for an upgrade?',
    content:
      'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?',
  },
];

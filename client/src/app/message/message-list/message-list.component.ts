
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Message, MessageService } from '../message.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { AuthService } from '../../auth/auth.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, FlexLayoutModule, MatIconModule, MatCardModule, MatMenuModule],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.sass'],
  animations: [
    trigger('staggeredSlideInOut', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('100ms', [
            animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger('100ms', [
            animate('500ms ease-out', style({ opacity: 0, transform: 'translateY(20px)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})

export class MessageListComponent implements OnDestroy {
  messages: Message[] = [];
  showMessages = true;
  private navigationSubscription: Subscription | undefined;

  constructor(private messageService: MessageService, public dialog: MatDialog, public authService: AuthService, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getMessages();

    this.navigationSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showMessages = false;
        this.cd.detectChanges(); 
      } else if (event instanceof NavigationEnd) {
        this.getMessages();
      }
    });
  }

  getMessages(): void {
    this.messageService.getMessages().subscribe((data: Message[]) => {
      this.messages = data;
    });
  }

  deleteMessage(id: number): void {
    this.messageService.deleteMessage(id).subscribe(() => {
      this.getMessages();
    });
  }

  openCreateDialog(): void {
    this.messageService.openCreateDialog();
  }

  openEditDialog(message: Message): void {
    this.messageService.openEditDialog(message)
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }
}
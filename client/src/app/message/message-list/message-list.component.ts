import { ChangeDetectorRef, Component } from '@angular/core';
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
    trigger('staggeredFadeIn', [
      transition('* => *', [
        query('.message-card', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('100ms', [
            animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
      ]),
      transition(':leave', [
        query('.message-card', [
          animate('0ms', style({ opacity: 0, transform: 'translateY(20px)' }))
        ])
      ])
    ])
  ]
})
export class MessageListComponent {
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
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '600px',
      data: { message: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.messageService.createMessage(result).subscribe(() => {
          this.getMessages();
        });
      }
    });
  }

  openEditDialog(message: Message): void {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '600px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && message.id) {
        this.messageService.updateMessage(message.id, result).subscribe(() => {
          this.getMessages();
        });
      }
    });
  }
}
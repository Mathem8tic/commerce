import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ChatComponent } from '../chat/chat.component';
import { AuthService } from '../../auth/auth.service';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ChatComponent,
  ],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.sass'],
})
export class MessageListComponent implements OnDestroy, OnInit {
  get currentUser() {
    return this.authService.getCurrentUser();
  }

  constructor(
    public authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  openCreateDialog(): void {
    this.messageService.openCreateDialog();
  }
}

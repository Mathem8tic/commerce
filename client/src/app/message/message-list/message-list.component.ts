import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ChatComponent } from '../chat/chat.component';
import { AuthService } from '../../auth/auth.service';
import { MessageService } from '../message.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Conversation } from '../../conversation/conversation';
import { ConversationService } from '../../conversation/conversation.service';
import { ChatBottomSheetComponent } from '../chat-bottom-sheet/chat-bottom-sheet.component';

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
  selectedConversationSubscription: Subscription = new Subscription();
  selectedConversation: Conversation | null = null;

  conversations: Conversation[] = [];
  conversationSubscription: Subscription = new Subscription();

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.selectedConversationSubscription =
      this.conversationService.selectedConversation$
        .pipe(distinctUntilChanged((prev, curr) => prev?.id === curr?.id))
        .subscribe((conversation) => {
          this.selectedConversation = conversation;
          if (this.selectedConversation) {
            this.messageService.getMessages(this.selectedConversation.id);
          }
        });

    this.conversationSubscription =
      this.conversationService.conversations$.subscribe((conversation) => {
        this.conversations = conversation;
      });
  }

  ngOnDestroy(): void {
    this.selectedConversationSubscription.unsubscribe();
    this.conversationSubscription.unsubscribe();
  }

  openCreateDialog(): void {
    this.messageService.openCreateDialog();
  }
}

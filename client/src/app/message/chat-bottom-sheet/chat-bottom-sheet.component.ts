import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../auth/auth.service';
import { ChatComponent } from '../chat/chat.component';
import { Conversation } from '../../conversation/conversation';
import { ConversationService } from '../../conversation/conversation.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { MessageService } from '../message.service';
import { User } from '../../auth/User';

@Component({
  selector: 'app-chat-bottom-sheet',
  templateUrl: './chat-bottom-sheet.component.html',
  styleUrls: ['./chat-bottom-sheet.component.sass'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    ChatSelectorComponent,
    ChatDialogComponent,
    ChatComponent,
  ],
})
export class ChatBottomSheetComponent implements OnInit, OnDestroy {
  selectedConversationSubscription: Subscription = new Subscription();
  selectedConversation: Conversation | null = null;

  conversations: Conversation[] = [];
  conversationSubscription: Subscription = new Subscription();

  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private bottomSheetRef: MatBottomSheetRef<ChatBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { currentUser: User }
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

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  openConversationDialog(conversation?: Conversation): void {
    if (this.data.currentUser) {
      this.conversationService.openConversationDialog(
        this.data.currentUser,
        conversation
      );
    }
  }
}

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
import { Conversation, Message, MessageService } from '../message.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../auth/auth.service';
import { ChatComponent } from '../chat/chat.component';

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
  selectedConversation: Conversation | null = null;

  get currentUser() {
    return this.data.authService.getCurrentUser();
  }

  constructor(
    private messageService: MessageService,
    private bottomSheetRef: MatBottomSheetRef<ChatBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { authService: AuthService; conversationId: string }
  ) {

  }

  ngOnInit(): void {
    this.messageService.selectedConversation$.subscribe((conversation) => {
      this.selectedConversation = conversation;
    });
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  openConversationDialog(conversation?: Conversation): void {
    if (this.currentUser) {
      this.messageService.openConversationDialog(
        this.data.authService,
        this.currentUser,
        conversation
      );
    }
  }

  ngOnDestroy(): void {}
}

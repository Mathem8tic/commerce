import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Conversation, MessageService } from '../message.service';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConversationDialogComponent } from '../conversation-dialog/conversation-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-chat-selector',
  templateUrl: './chat-selector.component.html',
  styleUrls: ['./chat-selector.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule
  ],
})
export class ChatSelectorComponent implements OnInit {
  conversations: Conversation[] = [];
  conversationControl = new FormControl();

  constructor(
    private messageService: MessageService,
    private cookieService: CookieService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.messageService.getUserConversations();
    this.messageService.conversations$.subscribe((conversations) => {
      this.conversations = conversations;
      this.setInitialConversation();
    });

    this.messageService.selectedConversation$.subscribe(conversation => {
      this.conversationControl.setValue(conversation);
    });
  }

  setInitialConversation() {
    const conversationId = this.cookieService.get('conversation_id');
    const selectedConversation = this.conversations.find(conversation => conversation.id === conversationId);

    if (selectedConversation) {
      this.messageService.setSelectedConversation(selectedConversation);
    }
  }

  onConversationChange(event: MatSelectChange): void {
    if (event.value === 'new') {
      this.openConversationDialog(null);
    } else {
      const selectedConversation = event.value;
      this.cookieService.set('conversation_id', selectedConversation.id);
      this.messageService.setSelectedConversation(selectedConversation);
    }
  }

  openConversationDialog(conversation: Conversation | null): void {
    this.messageService.openConversationDialog();
  }
}

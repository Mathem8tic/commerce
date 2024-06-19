import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Conversation, MessageService } from '../message.service';
import { CookieService } from 'ngx-cookie-service';

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
  ],
})
export class ChatSelectorComponent implements OnInit {
  conversations: Conversation[] = [];
  conversationControl = new FormControl();

  constructor(
    private messageService: MessageService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.messageService.getUserConversations();
    this.messageService.conversations$.subscribe((conversations) => {
      this.conversations = conversations;
    });
  }

  onConversationChange(event: MatSelectChange): void {
    const selectedConversation = event.value;
    this.cookieService.set('conversation_id', event.value.id);
    this.messageService.setSelectedConversation(selectedConversation);
  }
}

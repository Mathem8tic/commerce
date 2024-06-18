import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Conversation, Message, MessageService } from '../message.service';
import { NgFor } from '@angular/common';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-chat-bottom-sheet',
  templateUrl: './chat-bottom-sheet.component.html',
  styleUrls: ['./chat-bottom-sheet.component.sass'],
  standalone: true,
  imports: [
    NgFor,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatMenuModule,
    ChatSelectorComponent,
    ChatDialogComponent
  ],
})
export class ChatBottomSheetComponent implements OnInit {
  selectedConversation: Conversation | null = null;

  messageForm: FormGroup;
  messages: Message[] = [];

  conversations: Conversation[] = [];
  conversationControl = new FormControl();

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private bottomSheetRef: MatBottomSheetRef<ChatBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { conversationId: string }
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMessages();

    this.messageService.messages$.subscribe((messages) => {
      this.messages = messages;
    });

    this.messageService.selectedConversation$.subscribe((conversation) => {
      this.selectedConversation = conversation;
      // if (conversation) {
      //   this.loadMessages(conversation.id);
      // }
    });
  }

  loadMessages() {
    this.messageService
      .getMessages(this.data.conversationId);
 
  }

  sendMessage() {
    if (this.messageForm.valid) {
      const message: Message = {
        ...this.messageForm.value,
        conversationId: this.data.conversationId,
      };
      this.messageService.createMessage(message).subscribe((newMessage) => {
        this.messages.push(newMessage);
        this.messageForm.reset();
      });
    }
  }

  close() {
    this.bottomSheetRef.dismiss();
  }
}

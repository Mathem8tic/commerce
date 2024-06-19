import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
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
import { Observable, Subscription } from 'rxjs';
import { WebSocketService } from '../../websocket/websocket.service';

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
    ChatDialogComponent,
  ],
})
export class ChatBottomSheetComponent implements OnInit, OnDestroy {
  selectedConversation: Conversation | null = null;

  messageForm: FormGroup;
  messages$: Observable<Message[]>;
  private wsSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private websocketService: WebSocketService,
    private bottomSheetRef: MatBottomSheetRef<ChatBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { conversationId: string }
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required],
    });

    this.messages$ = this.messageService.messages$;
  }

  setupSockets() {
    if (this.selectedConversation) {
      this.websocketService.connect(this.selectedConversation.id);
      this.wsSubscription = this.websocketService
        .onMessage()
        .subscribe((message: any) => {
          console.log('incoming message: ', message);
          this.messageService.handleIncomingMessage(message.message);
        });
    }
  }

  ngOnInit(): void {
    this.messageService.selectedConversation$.subscribe((conversation) => {
      this.selectedConversation = conversation;
      if (this.selectedConversation) {
        this.setupSockets();
      }
    });

    // Initial load of messages
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.data.conversationId);
  }

  sendMessage(): void {
    const content = this.messageForm.get('content')?.value;

    if (content && this.selectedConversation) {
      const message: Message = {
        content,
        conversation_id: this.selectedConversation.id,
      };

      this.websocketService.sendMessage({
        message: {
          content,
          conversation_id: this.selectedConversation.id,
        },
      });

      this.messageForm.reset();
    }
  }

  close() {
    this.bottomSheetRef.dismiss();
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}

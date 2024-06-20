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
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Observable, Subscription } from 'rxjs';
import { WebSocketService } from '../../websocket/websocket.service';
import { User } from '../../auth/User';
import { AuthService } from '../../auth/auth.service';

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
  ],
})
export class ChatBottomSheetComponent implements OnInit, OnDestroy {
  selectedConversation: Conversation | null = null;

  messageForm: FormGroup;
  messages$: Observable<Message[]>;
  private wsSubscription: Subscription = new Subscription();
  private currentRoom: string | null = null;

  currentUser$: Observable<User | null>;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private websocketService: WebSocketService,
    private bottomSheetRef: MatBottomSheetRef<ChatBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { conversationId: string }
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required],
    });

    this.messages$ = this.messageService.messages$;
    this.currentUser$ = this.authService.user$;
  }

  setupSockets() {
    if (this.selectedConversation && this.selectedConversation.id !== this.currentRoom) {
      if (this.currentRoom) {
        this.websocketService.disconnect(this.currentRoom); // Disconnect previous WebSocket connection
      }
      this.websocketService.connect(this.selectedConversation.id); // Connect to the new WebSocket
      this.currentRoom = this.selectedConversation.id; // Update current room
      this.wsSubscription.unsubscribe(); // Unsubscribe previous subscription if any
      this.wsSubscription = this.websocketService.onMessage(this.currentRoom).subscribe((message: Message) => {
        this.messageService.handleIncomingMessage(message);
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

    this.getMessages();
  }

  getMessages(): void {
    this.messageService.getMessages(this.data.conversationId);
  }

  sendMessage(): void {
    const content = this.messageForm.get('content')?.value;

    if (content && this.selectedConversation) {
      const message: Message = {
        content,
        conversation_id: this.selectedConversation.id,
      };

      this.websocketService.sendMessage(this.selectedConversation.id, { message });
      this.messageForm.reset();
    }
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  openConversationDialog(conversation?: Conversation): void {
    this.messageService.openConversationDialog(conversation);
  }

  ngOnDestroy(): void {
    if (this.currentRoom) {
      this.websocketService.disconnect(this.currentRoom);
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}

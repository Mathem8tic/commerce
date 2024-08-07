import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MessageService } from '../message.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Observable, Subscription } from 'rxjs';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WebSocketService } from '../../websocket/websocket.service';
import { User } from '../../auth/User';
import { Message } from '../message';
import { Conversation } from '../../conversation/conversation';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCardModule,
    MatMenuModule,
    ChatDialogComponent,
    ChatSelectorComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.sass'],
})
export class ChatComponent implements OnDestroy, OnInit {
  @Input() currentUser: User | null = null;
  @Input() size: string | undefined;
  @Input() conversations!: Conversation[];
  @Input() selectedConversation!: Conversation | null;

  messageForm: FormGroup;
  messages$: Observable<Message[]>;

  private wsSubscription: Subscription = new Subscription();
  private currentRoom: string | null = null;

  constructor(
    private messageService: MessageService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private websocketService: WebSocketService
  ) {
    this.messages$ = this.messageService.messages$;

    this.messageForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedConversation']) {
      this.setupSockets();
    }
  }

  setupSockets() {
    if (
      this.selectedConversation &&
      this.selectedConversation.id !== this.currentRoom
    ) {
      if (this.currentRoom) {
        this.websocketService.disconnect(this.currentRoom);
      }
      this.websocketService.connect(this.selectedConversation.id);
      this.currentRoom = this.selectedConversation.id;
      this.wsSubscription.unsubscribe();
      this.wsSubscription = this.websocketService
        .onMessage(this.currentRoom)
        .subscribe((message: Message) => {
          this.messageService.handleIncomingMessage(message);
        });
    }
  }

  getMessages() {
    if (this.selectedConversation) {
      this.messageService.getMessages(this.selectedConversation.id);
    }
  }

  deleteMessage(id: string): void {
    this.messageService.deleteMessage(id).subscribe(() => {
      this.getMessages();
    });
  }

  openCreateDialog(): void {
    this.messageService.openCreateDialog();
  }

  openEditDialog(message: Message): void {
    this.messageService.openEditDialog(message);
  }

  ngOnDestroy(): void {
    if (this.currentRoom) {
      this.websocketService.disconnect(this.currentRoom);
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  sendMessage(): void {
    console.log('sending message');
    const content = this.messageForm.get('content')?.value;

    if (content && this.selectedConversation) {
      const message: Message = {
        content,
        conversation_id: this.selectedConversation.id,
      };

      this.websocketService.sendMessage(this.selectedConversation.id, {
        message,
      });
      this.messageForm.reset();
    }
  }
}

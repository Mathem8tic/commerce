import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Conversation, Message, MessageService } from '../message.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../auth/User';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WebSocketService } from '../../websocket/websocket.service';

@Component({
  selector: 'app-message-list',
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
    ChatSelectorComponent
  ],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.sass'],
  animations: [
    trigger('staggeredSlideInOut', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-20px)' }),
            stagger('100ms', [
              animate(
                '1000ms ease-in',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
        query(
          ':leave',
          [
            stagger('100ms', [
              animate(
                '1000ms ease-out',
                style({ opacity: 0, transform: 'translateY(20px)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class MessageListComponent implements OnDestroy, OnInit {
  messageForm: FormGroup;
  messages$: Observable<Message[]>;
  currentUser$: Observable<User | null>;
  showMessages = true;
  private navigationSubscription: Subscription | undefined;
  private wsSubscription: Subscription = new Subscription();
  private currentRoom: string | null = null;
  selectedConversation: Conversation | null = null;

  constructor(
    private messageService: MessageService,
    public dialog: MatDialog,
    public authService: AuthService,
    private fb: FormBuilder,
    private websocketService: WebSocketService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.messages$ = this.messageService.messages$;
    this.currentUser$ = this.authService.user$;

    this.messageForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.messageService.selectedConversation$.subscribe((conversation) => {
      this.selectedConversation = conversation;
      if (this.selectedConversation) {
        this.setupSockets();
      }
    });

    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.showMessages = false;
        this.cd.detectChanges();
      } else if (event instanceof NavigationEnd) {
        this.showMessages = true;
        this.setupSockets();
      }
    });
  }

  setupSockets() {
    if (this.selectedConversation && this.selectedConversation.id !== this.currentRoom) {
      if (this.currentRoom) {
        this.websocketService.disconnect(this.currentRoom); // Disconnect previous WebSocket connection
      }
      this.websocketService.connect(this.selectedConversation.id); // Connect to the new WebSocket
      this.currentRoom = this.selectedConversation.id;
      this.wsSubscription.unsubscribe(); // Unsubscribe previous subscription if any
      this.wsSubscription = this.websocketService.onMessage(this.currentRoom).subscribe((message: Message) => {
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
    this.navigationSubscription?.unsubscribe();
    if (this.currentRoom) {
      this.websocketService.disconnect(this.currentRoom
      );
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
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
}

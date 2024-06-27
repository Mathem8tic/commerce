import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Conversation, MessageService } from '../message.service';
import { CookieService } from 'ngx-cookie-service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/User';
import { distinctUntilChanged } from 'rxjs/operators';

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
    MatDividerModule,
  ],
})
export class ChatSelectorComponent implements OnInit {
  @Input() authService!: AuthService;
  @Input() user: User | null = null;
  conversations: Conversation[] = [];
  conversationControl = new FormControl();

  constructor(
    private messageService: MessageService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    // this.messageService.getUserConversations();
    // this.messageService.conversations$.subscribe((conversations) => {
    //   this.conversations = conversations;
    //   this.setInitialConversation();
    // });

    this.messageService.selectedConversation$.pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
    ).subscribe((conversation) => {
      console.log('selected conversation changed: ', conversation)
      this.conversationControl.setValue(conversation);
    });
  }

  setInitialConversation() {
    const conversationId = this.cookieService.get('conversation_id');
    const selectedConversation = this.conversations.find(
      (conversation) => conversation.id === conversationId
    );

    console.log('selectedconversation: ', selectedConversation);

    if (selectedConversation) {
      this.messageService.setSelectedConversation(selectedConversation);
    }
  }

  onConversationChange(event: MatSelectChange): void {
    if (event.value === 'new') {
      this.openConversationDialog(undefined);
    } else {
      const selectedConversation = event.value;
      this.messageService.setSelectedConversation(selectedConversation);
    }
  }

  openConversationDialog(conversation: Conversation | undefined): void {
    if (this.user) {
      this.messageService.openConversationDialog(
        this.authService,
        this.user,
        conversation
      );
    }
  }
}

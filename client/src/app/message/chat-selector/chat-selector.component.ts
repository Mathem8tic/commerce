import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/User';
import { ConversationService } from '../../conversation/conversation.service';
import { Conversation } from '../../conversation/conversation';

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
export class ChatSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() authService!: AuthService;
  @Input() currentUser: User | null = null;
  @Input() conversations!: Conversation[];
  @Input() selectedConversation!: Conversation | null;

  conversationControl = new FormControl();

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.conversationService.getUserConversations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('setting in selector: ', changes['selectedConversation']);
    if (changes['selectedConversation']) {
      this.conversationControl.setValue(
        changes['selectedConversation'].currentValue
      );
    }
  }

  ngOnDestroy(): void {}

  onConversationChange(event: MatSelectChange): void {
    if (event.value === 'new') {
      this.openConversationDialog(undefined);
    } else {
      this.conversationService.setSelectedConversation(event.value);
    }
  }

  openConversationDialog(conversation: Conversation | undefined): void {
    if (this.currentUser) {
      this.conversationService.openConversationDialog(
        this.currentUser,
        conversation
      );
    }
  }
}

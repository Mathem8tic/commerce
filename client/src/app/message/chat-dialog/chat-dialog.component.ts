import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { User } from '../../auth/User';
import { Message } from '../message';

export interface ChatMessage {
  username: string;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.sass'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
})
export class ChatDialogComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() messages$!: Observable<Message[]>;
  @Input() size: string | undefined;
  @Input() currentUser: User | null = null;
  
  messages: Message[] = [];
  @ViewChild('chatDialog') private chatDialog: ElementRef | undefined;

  ngOnInit() {
    this.scrollToBottom();
    this.messages$.subscribe((messages) => {
      this.messages = messages;
      this.scrollToBottom();
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.chatDialog) {
      try {
        this.chatDialog.nativeElement.scrollTop =
          this.chatDialog?.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Could not scroll to bottom', err);
      }
    }
  }
}

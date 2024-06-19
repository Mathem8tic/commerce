import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Message } from '../message.service';
import { Observable } from 'rxjs';

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
  imports: [CommonModule, MatCardModule, MatListModule]
})
export class ChatDialogComponent {
  @Input() messages$!: Observable<Message[]>;
}
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UserService } from '../user.service';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AddressDialogComponent } from '../../address/address-dialog/address-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Address } from '../../address/address.service';
import { Conversation, MessageService } from '../../message/message.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ChatBottomSheetComponent } from '../../message/chat-bottom-sheet/chat-bottom-sheet.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
  ],
})
export class UserProfileComponent implements OnInit {
  user: any;
  error: string | null = null;
  isBrowser: boolean;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private bottomSheet: MatBottomSheet,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getProfile();
    }
  }

  getProfile() {
    this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.error = error;
      },
    });
  }

  openChat(conversation: Conversation) {
    this.messageService.setSelectedConversation(conversation);
    const chatBottomSheet = this.bottomSheet.open(ChatBottomSheetComponent, {
      data: { authService: this.authService, conversationId: conversation.id },
    });
  }

  openAddressDialog(address?: Address) {
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      data: { address: address || null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('result', result);
        if (result.delete) {
          this.user.addresses = this.user.addresses.filter(
            (a: Address) => a.id !== result.address.id
          );
        } else if (result.update) {
          const index = this.user.addresses.findIndex(
            (a: Address) => a.id === result.address.id
          );
          if (index !== -1) {
            this.user.addresses[index] = result.address;
          }
        } else if (result.create) {
          this.user.addresses.push(result.address);
        }

        this.getProfile();
      }
    });
  }
}

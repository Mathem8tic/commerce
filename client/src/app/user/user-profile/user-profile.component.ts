import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UserService } from '../user.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Address } from 'cluster';
import { AddressDialogComponent } from '../../address/address-dialog/address-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
})
export class UserProfileComponent implements OnInit {
  user: any;
  error: string | null = null;
  isBrowser: boolean;

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
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
  }

  openAddressDialog(address?: Address) {
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      data: { address: address || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.loadAddresses();
      }
    });
  }
}

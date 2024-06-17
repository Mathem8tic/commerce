import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  template: `
    <div class="loading-container">
      <mat-spinner></mat-spinner>
      <p>Loading...</p>
    </div>
  `,
  styleUrls: ['./loading-dialog.component.sass'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ]
})
export class LoadingDialogComponent { }
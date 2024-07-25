import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MessageService } from '../message.service';
import { Message } from '../message';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.sass'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class MessageDialogComponent {
  messageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: Message }
  ) {
    this.messageForm = this.fb.group({
      content: [data.message ? data.message.content : '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.messageForm.valid) {
      if (this.data.message) {
        this.messageService.updateMessage(this.data.message.id!, this.messageForm.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.messageService.createMessage(this.messageForm.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
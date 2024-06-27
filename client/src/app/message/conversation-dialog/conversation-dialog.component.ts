import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Conversation } from '../message.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-conversation-dialog',
  templateUrl: './conversation-dialog.component.html',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
})
export class ConversationDialogComponent implements OnInit {
  conversationForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ConversationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.conversationForm = this.fb.group({
      title: ['', Validators.required],
      email_address: ['', [Validators.email]],
      phone: [''],
    });

    if (data) {
      this.conversationForm.patchValue(data.conversation);
    }
  }

  onRemoveUser(): void {
    this.dialogRef.close({ delete: true, userId: this.data.authService.currentUser.id });
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.conversationForm.valid) {
      const formData = { ...this.conversationForm.value, id: this.data?.id };
      this.dialogRef.close(formData);
    }
  }
}

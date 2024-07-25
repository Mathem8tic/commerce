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
import { JsonPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-conversation-dialog',
  templateUrl: './conversation-dialog.component.html',
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
})
export class ConversationDialogComponent implements OnInit {
  conversationForm: FormGroup;

  get currentUser() {
    return this.data.authService.getCurrentUser();
  }

  constructor(
    public dialogRef: MatDialogRef<ConversationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.conversationForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      email_address: ['', [Validators.email]],
      phone: [''],
    });

    if (data) {
      this.conversationForm.patchValue(data.conversation);
    }
  }

  onRemoveUser(): void {
    if (this.currentUser) {
      this.dialogRef.close({
        delete: true,
        userId: this.currentUser.id,
      });
    }
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.conversationForm.valid) {
      this.dialogRef.close(this.conversationForm.value);
    }
  }
}

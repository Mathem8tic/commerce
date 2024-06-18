import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { AddressService, Address } from '../address.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule, NgFor } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.sass'],
  standalone: true,
  imports: [
    NgFor,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
})
export class AddressDialogComponent implements OnInit {
  addressForm: FormGroup;
  addressTypes = [
    { value: 'billing', viewValue: 'Billing' },
    { value: 'shipping', viewValue: 'Shipping' },
  ];

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { address: Address }
  ) {
    this.addressForm = this.fb.group({
      street: [data?.address?.street || '', Validators.required],
      city: [data?.address?.city || '', Validators.required],
      state: [data?.address?.state || '', Validators.required],
      postal_code: [data?.address?.postal_code || '', Validators.required],
      country: [data?.address?.country || '', Validators.required],
      type: [data?.address?.type || '', Validators.required],
      is_primary_shipping: [data?.address?.is_primary_shipping || false],
      is_primary_billing: [data?.address?.is_primary_billing || false],
    });
  }

  ngOnInit(): void {}

  save() {
    if (this.addressForm.valid) {
      const address: Address = this.addressForm.value;
      if (this.data.address.id && this.data.address) {
        this.addressService
          .updateAddress(this.data.address.id, address)
          .subscribe(() => {
            this.dialogRef.close(true);
          });
      } else {
        this.addressService.createAddress(address).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  delete() {
    if (this.data.address.id) {
      this.addressService.deleteAddress(this.data.address.id).subscribe(() => {
        this.dialogRef.close(true);
          this.snackBar.open('Address deleted successfully', 'Close', {
            duration: 3000,
          });
      });
    }
  }
}

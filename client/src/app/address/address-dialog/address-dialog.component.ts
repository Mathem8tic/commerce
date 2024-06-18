import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AddressService, Address } from '../address.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.sass'],
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class AddressDialogComponent implements OnInit {
  addressForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { address: Address }
  ) {
    this.addressForm = this.fb.group({
      street: [data?.address?.street || '', Validators.required],
      city: [data?.address?.city || '', Validators.required],
      state: [data?.address?.state || '', Validators.required],
      postal_code: [data?.address?.postal_code || '', Validators.required],
      country: [data?.address?.country || '', Validators.required]
    });
  }

  ngOnInit(): void {}

  save() {
    if (this.addressForm.valid) {
      const address: Address = this.addressForm.value;
      if (this.data.address) {
        this.addressService.updateAddress(this.data.address.id, address).subscribe(() => {
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
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary_billing: boolean;
  is_primary_shipping: boolean;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = environment.apiUrl + 'addresses/';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  createAddress(address: Address): Observable<Address> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.post<Address>(this.apiUrl, address).pipe(
      tap(() => this.showNotification('Address created successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  updateAddress(id: string | null, address: Address): Observable<Address> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.put<Address>(`${this.apiUrl}${id}/`, address).pipe(
      tap(() => this.showNotification('Address updated successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  deleteAddress(id: string): Observable<void> {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.showNotification('Address deleted successfully')),
      catchError(this.handleError),
      finalize(() => dialogRef.close())
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    this.showNotification('Something went wrong; please try again later.');
    return throwError('Something went wrong; please try again later.');
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}
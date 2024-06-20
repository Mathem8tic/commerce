import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Message {
  title: string;
  content: string;
  created_at: string;
}

interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  addresses: Address[];
  messages: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl + 'profile/';

  constructor(private http: HttpClient, private dialog: MatDialog,) {}

  getUserProfile(): Observable<User> {
    // const dialogRef = this.dialog.open(LoadingDialogComponent, {
    //   disableClose: true
    // });

    return this.http.get<User>(this.apiUrl).pipe(
      tap(() => null),
      catchError(this.handleError),
      // finalize(() => dialogRef.close())
    );
    
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof Error) {
      // A client-side or network error occurred.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }
}

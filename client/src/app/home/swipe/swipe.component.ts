import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../../message/message-dialog/message-dialog.component';
import { treatments } from '../../app.component';

@Component({
  selector: 'app-swipe',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './swipe.component.html',
  styleUrl: './swipe.component.sass',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SwipeComponent implements OnInit {
  isBrowser: boolean;

  treatments = treatments;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private dialog: MatDialog
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    import('swiper/element/bundle').then((module) => {
      module.register();
    });
  }

  openCreateMessageDialog(): void {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '600px',
      data: { message: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
}

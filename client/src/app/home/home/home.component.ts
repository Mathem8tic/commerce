import { Component } from '@angular/core';
import { SwipeComponent } from '../swipe/swipe.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SwipeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {

}

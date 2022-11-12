import { Component } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

//https://colorhunt.co/palette/273948

const enterTransition = transition(':enter', [
  style({ opacity: 0, }),
  animate('1s ease-in', style({ width: 1000 })),
]);

const exitTransition = transition(':leave', [
  style({
    opacity: 1,
  }),
  animate('1s ease-out', style({ width: 800
  })),
])

const fadeIn = trigger('fadeIn', [enterTransition]);
const fadeOut = trigger('fadeOut', [exitTransition]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeIn]
})
export class AppComponent {
  counter = 10;
  isShown = true;
  title = 'kab-dev';

  ngOnInit(){
    console.log("nerd :P");
    this.countdown();

  }

  countdown() {
    var redirectInterval = setInterval(() =>{
      this.counter--;
      if (this.counter === 0) {
        clearInterval(redirectInterval);
        // window.location.href ="https://youtu.be/dQw4w9WgXcQ";
      }
    }, 1000);
  }

  fadeInOut() {
    this.isShown = !this.isShown;
  }
}
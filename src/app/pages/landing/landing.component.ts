import { Component } from '@angular/core';

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  title = 'kab-dev';

  ngOnInit(){
    console.log("nerd :P")

    var timer = setTimeout(function() {
      window.location.href ="https://youtu.be/dQw4w9WgXcQ"
  }, 3000);
  }
}

import { Component } from '@angular/core';

//https://colorhunt.co/palette/273948

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <div style="text-align:center" class="content main">
      <div style="text-align:center" class="content wrapper">
        <h1>R<span style="color: #f05945">i</span>ck R<span style="color: #f05945">o</span>ll<span style="color: #f05945">e</span>d 🤭</h1>
        <iframe width="300vh" height="300vh" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" title="Rick Rolled 🤪" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; autoplay" id="rickVid"></iframe>
        <audio autoplay loop  id="playAudio">
            <source src="https://www.myinstants.com/media/sounds/epic.mp3">
        </audio>
        <div style="margin-top:5%">
          <img src="https://i.kym-cdn.com/photos/images/original/000/569/146/2c9.gif" alt="BMO Dance" id="BMO">
        </div>
      </div>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'kab-dev';

  ngOnInit(){
    console.log("nerd :P")
  }
}
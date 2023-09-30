import { Component, Input } from "@angular/core";

@Component({
  selector: "app-pokemon-card",
  templateUrl: "./pokemon-card.component.html",
  styleUrls: ["./pokemon-card.component.scss"],
})
export class PokemonCardComponent {
  @Input() pokemon: any; // Input property to receive Pokemon data from parent component
  imageError1 = false;
  imageError2 = false;
  hidden = false;

  handleImageError(event: Event) {
    this.imageError1 = true;
  }

  handleImageError2(event: Event) {
    this.imageError2 = true;
  }

  hideItem() {
    this.hidden = !this.hidden;
  }
}

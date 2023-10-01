import { Component, Input, EventEmitter, Output, HostListener } from "@angular/core";
import { PokemonStats } from "src/app/pages/pokedle/pokedle.component";

@Component({
  selector: "app-pokemon-card",
  templateUrl: "./pokemon-card.component.html",
  styleUrls: ["./pokemon-card.component.scss"],
})
export class PokemonCardComponent {
  pokemonStats: PokemonStats = {
    name: "",
    image: "",
    type1: "",
    type2: "",
    color: "",
    abilities: [],
    egggroup: [],
    weight: 0,
    stats: 0,
  };

  @Input() pokemon: any; // Input property to receive Pokemon data from parent component

  @Output() hoverEvent = new EventEmitter<PokemonStats>();

  imageError1 = false;
  imageError2 = false;
  hidden = false;

  ngOnInit() {
    this.pokemonStats = this.mapPokemon(this.pokemon);
  }

  mapPokemon(pokemon: any) {
    if (!pokemon) {
      return;
    }

    const sprite =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
      pokemon?.id +
      ".png";
    let totalBaseStat = 0;
    pokemon?.pokemon_v2_pokemonstats.forEach((stat: { base_stat: number }) => {
      totalBaseStat += stat.base_stat;
    });

    const pokemonObj: any = {
      name: pokemon?.name,
      image: sprite,
      type1: pokemon?.pokemon_v2_pokemontypes[0]?.pokemon_v2_type?.name,
      type2:
        pokemon?.pokemon_v2_pokemontypes[1]?.pokemon_v2_type?.name ?? "N/A",
      color: pokemon?.pokemon_v2_pokemonspecy?.pokemon_v2_pokemoncolor?.name,
      abilities: pokemon?.pokemon_v2_pokemonabilities,
      egggroup: pokemon?.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonegggroups,
      weight: pokemon?.weight / 10,
      stats: totalBaseStat,
    };

    return pokemonObj;
  }

  handleImageError(event: Event) {
    this.imageError1 = true;
  }

  handleImageError2(event: Event) {
    this.imageError2 = true;
  }

  hideItem() {
    this.hidden = !this.hidden;
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.hoverEvent.emit(this.pokemonStats);
  }
}

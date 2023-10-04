import {
  Component,
  Input,
  EventEmitter,
  Output,
  HostListener,
  SimpleChanges,
} from "@angular/core";
import { PokemonStats } from "src/app/pages/pokedle/pokedle.component";

const ArrayComparisonResult = {
  Same: "Same",
  CommonValues: "CommonValues",
  NoCommonValues: "NoCommonValues",
};

@Component({
  selector: "app-pokemon-card",
  templateUrl: "./pokemon-card.component.html",
  styleUrls: ["./pokemon-card.component.scss"],
})
export class PokemonCardComponent {
  pokemonStats: PokemonStats = {
    displayName: "",
    name: "",
    image: "",
    type1: "",
    type2: "",
    color: "",
    abilities: [],
    egggroup: [],
    weight: 0,
    stats: 0,
    species: "",
    description: ""
  };

  @Input() pokemon: any; // Input property to receive Pokemon data from parent component
  @Input() correctlyGuessed!: PokemonStats;
  @Output() hoverEvent = new EventEmitter<PokemonStats>();
  @Output() clickEvent = new EventEmitter<PokemonStats>();

  imageErrors: { [key: string]: boolean } = {
    imageError1: false,
    imageError2: false,
    imageError3: false,
    imageError4: false,
  };
  hidden = false;

  ngOnInit() {
    this.pokemonStats = this.mapPokemon(this.pokemon);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.correctlyGuessed && changes.correctlyGuessed.currentValue) {
      this.checkIfStillValid();
    }
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

    let name = pokemon?.name;
    if (name.endsWith("-alola")) {
      name += "n";
    } else if (name.endsWith("-galar")) {
      name += "ian";
    } else if (name.endsWith("-hisui")) {
      name += "an";
    } else if (name.endsWith("necrozma-dusk")) {
      name += "-mane";
    } else if (name.endsWith("necrozma-dawn")) {
      name += "-wings";
    } else if (name.includes("-galar-")) {
      name = name.replace("-galar-", "-galarian-");
    } else if (name.endsWith("calyrex-ice")) {
      name += "-rider";
    } else if (name.endsWith("calyrex-shadow")) {
      name += "-rider";
    } else if (name.includes("-disguised")) {
      name = name.replace("-disguised", "");
    }

    const pokemonObj: any = {
      displayName: name,
      name: pokemon.name,
      image: sprite,
      type1: pokemon?.pokemon_v2_pokemontypes[0]?.pokemon_v2_type?.name,
      type2:
        pokemon?.pokemon_v2_pokemontypes[1]?.pokemon_v2_type?.name ?? "N/A",
      color: pokemon?.pokemon_v2_pokemonspecy?.pokemon_v2_pokemoncolor?.name,
      abilities: pokemon?.pokemon_v2_pokemonabilities,
      egggroup: pokemon?.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonegggroups,
      weight: pokemon?.weight / 10,
      stats: totalBaseStat,
      species: pokemon?.pokemon_v2_pokemonspecy?.name,
      description: pokemon?.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesflavortexts?.[0]?.flavor_text.replace(/[\n\f]/g, " ").replace("é", "e"),
    };
    return pokemonObj;
  }

  checkIfStillValid() {
    if (
      this.correctlyGuessed.type1 != "" &&
      this.correctlyGuessed.type1 != this.pokemonStats.type1
    ) {
      this.hidden = true;
      return;
    }
    if (
      this.correctlyGuessed.type2 != "" &&
      this.correctlyGuessed.type2 != this.pokemonStats.type2
    ) {
      this.hidden = true;
      return;
    }
    if (
      this.correctlyGuessed.color != "" &&
      this.correctlyGuessed.color != this.pokemonStats.color
    ) {
      this.hidden = true;
      return;
    }
    if (
      this.correctlyGuessed.weight != 0 &&
      this.correctlyGuessed.weight != this.pokemonStats.weight
    ) {
      this.hidden = true;
      return;
    }
    if (
      this.correctlyGuessed.stats != 0 &&
      this.correctlyGuessed.stats != this.pokemonStats.stats
    ) {
      this.hidden = true;
      return;
    }
    if (
      this.correctlyGuessed.egggroup.length != 0 &&
      this.compareArrays(
        this.pokemonStats.egggroup,
        this.correctlyGuessed.egggroup,
        "pokemon_v2_egggroup",
        "name"
      ) === ArrayComparisonResult.NoCommonValues
    ) {
      this.hidden = true;
      return;
    }
    if (
      this.correctlyGuessed.abilities.length != 0 &&
      this.compareArrays(
        this.pokemonStats.abilities,
        this.correctlyGuessed.abilities,
        "pokemon_v2_ability",
        "name"
      ) === ArrayComparisonResult.NoCommonValues
    ) {
      this.hidden = true;
      return;
    }
  }

  compareArrays(
    array1: any[],
    array2: any[],
    comparison: string | number,
    nestedComparison?: string | number
  ) {
    // Check if both arrays have the same objects in the same order
    if (JSON.stringify(array1) === JSON.stringify(array2)) {
      return ArrayComparisonResult.Same;
    }

    // Check if any object in array1 exists in array2 based on the primary comparison
    const commonValuesExist = array1.some((obj1) =>
      array2.some((obj2) =>
        nestedComparison
          ? obj1[comparison]?.[nestedComparison] ===
            obj2[comparison]?.[nestedComparison]
          : obj1[comparison] === obj2[comparison]
      )
    );

    if (commonValuesExist) {
      return ArrayComparisonResult.CommonValues;
    }

    // If none of the above conditions are met, there are no common values
    return ArrayComparisonResult.NoCommonValues;
  }

  handleImageError(errorFlag: string) {
    this.imageErrors[errorFlag] = true;
  }

  hideItem() {
    this.hidden = !this.hidden;
  }

  @HostListener("mouseenter") onMouseEnter() {
    this.hoverEvent.emit(this.pokemonStats);
  }

  @HostListener("click", ["$event"])
  onClick(event: Event): void {
    // Emit the event here with this.pokemon.name
    this.clickEvent.emit(this.pokemonStats);
  }
}

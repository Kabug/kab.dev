import { Component, TemplateRef, ViewChild } from "@angular/core";
import { PokeService } from "src/app/services/poke.service";
import { FormControl } from "@angular/forms";
import { MatTableDataSource as MatTableDataSource } from "@angular/material/table";
import { MatDialog as MatDialog } from "@angular/material/dialog";
import { firstValueFrom } from "rxjs";
import data from "@root/pokedata.json";
import { DataService } from "../../services/data.service.ts";

// Name
// Type1
// Type2
// Ability Total
// Forms
// Egg groups
// Weight
// Stats

// Figure out gen la
// Make colourblind friendly

//Need to move this over to services later
export interface PokemonStats {
  displayName: string;
  name: string;
  image: string;
  type1: string;
  type2: string;
  color: string;
  abilities: Abilities[];
  egggroup: EggGroups[];
  weight: number;
  stats: number;
  species: string;
  description: string;
}

export interface Abilities {
  ability_id: number;
  pokemon_id: number;
  pokemon_v2_ability: Ability;
}

export interface Ability {
  name: string;
}

export interface EggGroups {
  pokemon_v2_pokemonegggroups: EggGroup[];
}

export interface EggGroup {
  name: string;
}

export interface AllPokemonPage {
  count: number;
  next: number | undefined;
  previous: number | undefined;
  results: [];
}

const ArrayComparisonResult = {
  Same: "Same",
  CommonValues: "CommonValues",
  NoCommonValues: "NoCommonValues",
};

const GAME_STATE = {
  START: "Start",
  WIN: "Win",
  LOSE: "Lose",
};

@Component({
  selector: "pokedle",
  templateUrl: "./pokedle.component.html",
  styleUrls: ["./pokedle.component.scss"],
})
export class PokedleComponent {
  @ViewChild("endDialog")
  endDialog!: TemplateRef<any>;
  pokeInputControl = new FormControl("");

  public ArrayComparisonResult = ArrayComparisonResult;
  public GAME_STATE = GAME_STATE;
  gameState = this.GAME_STATE.START;
  pokemonData: any;
  allPokemon: any;
  suggestedPokemons: any;
  todaysPokemon: PokemonStats = {
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
    description: "",
  };
  yesterdaysPokemon: PokemonStats = {
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
    description: "",
  };
  correctlyGuessed: PokemonStats = {
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
    description: "",
  };
  hoveredPokemon: any;
  guesses = 0;
  maxGuesses = 8;
  loading = false;
  customColor = "red";
  currentDate = new Date().toISOString();
  displayedColumns: string[] = [
    "image",
    "type1",
    "type2",
    "color",
    "abilities",
    "egggroup",
    "weight",
    "stats",
  ];

  dataSource: MatTableDataSource<PokemonStats> =
    new MatTableDataSource<PokemonStats>();

  maxStreak = 0;
  currentStreak = 0;

  constructor(
    private pokeService: PokeService,
    private dialog: MatDialog,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    await this.fetchData();
    this.pokeInputControl.valueChanges.subscribe((newValue) => {
      this.onPokeInput();
    });
    window.addEventListener("storage", (event: StorageEvent) => {
      const key = event.key;
      const newValue = event.newValue;
    
      switch (key) {
        case "guesses":
          const previousGuesses = JSON.parse(newValue || "null");
          if (Array.isArray(previousGuesses) && previousGuesses.length > 0) {
            previousGuesses.forEach((pokemon) => {
              this.allPokemon = this.allPokemon.filter(
                (pokemonObj: { name: any }) => pokemonObj.name !== pokemon?.name
              );
              this.extractSimilarValues(pokemon);
            });
            this.dataSource.data = previousGuesses;
            this.dataSource._updateChangeSubscription();
          }
          break;
    
        case "correctlyGuessed":
          const correctlyGuessed = JSON.parse(newValue || "null");
          if (correctlyGuessed) {
            this.correctlyGuessed = correctlyGuessed;
          }
          break;
    
        case "gameState":
          const gameState = newValue;
          if (gameState) {
            this.gameState = gameState;
          }
          break;

        default:
          break;
      }
    });
    

    const currentDate = new Date(this.currentDate);
    this.todaysPokemon = this.getRandomPokemon(this.currentDate);

    // Calculate yesterday's date by subtracting one day (24 hours)
    const yesterdaysDate = new Date(
      currentDate.getTime() - 24 * 60 * 60 * 1000
    );
    this.yesterdaysPokemon = this.getRandomPokemon(
      yesterdaysDate.toISOString()
    );
    this.hoveredPokemon = this.createPokemonObj(this.allPokemon?.[0]);

    const maxStreakString = localStorage.getItem("maxStreak");
    if (maxStreakString !== null) {
      const parsedMaxStreak = parseInt(maxStreakString, 10);
      if (!isNaN(parsedMaxStreak)) {
        this.maxStreak = parsedMaxStreak;
      }
    }

    const currentStreakString = localStorage.getItem("currentStreak");
    if (currentStreakString !== null) {
      const parsedCurrentStreak = parseInt(currentStreakString, 10);
      if (!isNaN(parsedCurrentStreak)) {
        this.currentStreak = parsedCurrentStreak;
      }
    }

    const savedDate = localStorage.getItem("savedDate");

    const savedDateFormatted = savedDate
      ? new Date(savedDate).toISOString().split("T")[0]
      : null;
    const currentDateFormatted = this.currentDate.split("T")[0];
    if (savedDateFormatted !== currentDateFormatted) {
      localStorage.removeItem("guesses");

      localStorage.setItem("savedDate", this.currentDate);

      this.dataSource.data = [];
      this.dataSource._updateChangeSubscription();
      localStorage.setItem("gameState", this.GAME_STATE.START);
      localStorage.removeItem("correctlyGuessed");
    } else {
      let previousGuesses = JSON.parse(
        localStorage.getItem("guesses") || "null"
      );

      if (Array.isArray(previousGuesses) && previousGuesses.length > 0) {
        previousGuesses.forEach((pokemon) => {
          this.allPokemon = this.allPokemon.filter(
            (pokemonObj: { name: any }) => pokemonObj.name !== pokemon?.name
          );

          this.extractSimilarValues(pokemon);
        });

        this.dataSource.data = previousGuesses;
        this.dataSource._updateChangeSubscription();
      }
      let correctlyGuessed = JSON.parse(
        localStorage.getItem("correctlyGuessed") || "null"
      );

      if (correctlyGuessed) {
        this.correctlyGuessed = correctlyGuessed;
      }

      let gamestate = localStorage.getItem("gameState");

      if (gamestate) {
        this.gameState = gamestate;
      }
    }
  }

  async fetchData(): Promise<void> {
    try {
      const fetchData = await firstValueFrom(this.dataService.getData());
      this.allPokemon = [];
      this.filterPokemon(fetchData?.data?.pokemon_v2_pokemon);
    } catch (error) {
      console.error(error);
      if (!data) {
        return;
      }
      console.log("resorting to backup");
      this.allPokemon = [];
      // @ts-ignore
      this.filterPokemon(data?.data?.pokemon_v2_pokemon);
    }
  }

  filterPokemon(unfilteredPokemon: any) {
    this.allPokemon = unfilteredPokemon;
  }

  createPokemonObj(pokemon: any) {
    const sprite =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
      pokemon?.id +
      ".png";
    let totalBaseStat = 0;
    pokemon?.pokemon_v2_pokemonstats.forEach((stat: { base_stat: number }) => {
      totalBaseStat += stat.base_stat;
    });

    const pokemonObj: PokemonStats = {
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
      species: pokemon?.pokemon_v2_pokemonspecy?.name,
      description:
        pokemon?.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesflavortexts?.[0]?.flavor_text
          .replace(/[\n\f]/g, " ")
          .replace("é", "e"),
      displayName: pokemon?.name,
    };
    return pokemonObj;
  }

  getRandomPokemon(date: string) {
    let seed = parseInt(date.split("T", 1)[0].replace(/\D/g, ""));
    var x = Math.sin(seed++) * 10000;
    const randomNum = Math.round(
      this.allPokemon?.length * Math.abs(x - Math.floor(x))
    ).toString();
    return this.createPokemonObj(this.allPokemon?.[randomNum]);
  }

  // Make a better search later
  // Make just filter by the values entered counting the order
  onPokeInput() {
    this.suggestedPokemons = this.allPokemon?.filter(
      (pokemon: { name: (string | undefined)[] }) =>
        pokemon?.name.includes(this.pokeInputControl.value?.toLowerCase())
    );
  }

  onSubmit(event: any) {
    event.preventDefault();
    if (!this.pokeInputControl.value) {
      return;
    }
    if (this.gameState === this.GAME_STATE.WIN) {
      this.openDialog();
      return;
    }
    if (
      this.maxGuesses - 1 < this.guesses ||
      this.gameState === this.GAME_STATE.LOSE
    ) {
      this.gameState = GAME_STATE.LOSE;
      this.openDialog();
      localStorage.setItem("currentStreak", "0");
      return;
    }
    let pokemon: { name: string } | undefined = undefined;

    const inputValue = this.pokeInputControl.value?.toLowerCase();

    if (inputValue) {
      pokemon = this.allPokemon?.find(
        (p: { name: string }) => p.name.toLowerCase() === inputValue
      );
    }
    if (!pokemon) {
      return;
    }
    this.guesses += 1;
    const formatPokemon = this.createPokemonObj(pokemon);
    this.dataSource?.data.unshift(formatPokemon);
    this.dataSource._updateChangeSubscription();
    localStorage.setItem("guesses", JSON.stringify(this.dataSource?.data));

    this.allPokemon = this.allPokemon.filter(
      (pokemonObj: { name: any }) => pokemonObj.name !== pokemon?.name
    );
    this.pokeInputControl.setValue("");

    this.extractSimilarValues(formatPokemon);

    if (pokemon?.name === this.todaysPokemon.name) {
      this.gameState = GAME_STATE.WIN;
      this.openDialog();
      const lastCorrectDateString = localStorage.getItem("lastCorrectDate");
      const lastCorrectDate = lastCorrectDateString
        ? new Date(lastCorrectDateString)
        : null;

      if (lastCorrectDate) {
        const daysDifference = this.getDayDifference(
          lastCorrectDate,
          this.currentDate
        );
        if (daysDifference === 1) {
          this.currentStreak += 1;
        } else {
          this.currentStreak = 1;
        }
      } else {
        this.currentStreak = 1;
      }

      if (this.maxStreak < this.currentStreak) {
        this.maxStreak = this.currentStreak;
        localStorage.setItem("maxStreak", this.currentStreak.toString());
      }
      localStorage.setItem("currentStreak", this.currentStreak.toString());
      localStorage.setItem("lastCorrectDate", this.currentDate);
      localStorage.setItem("gameState", this.GAME_STATE.WIN);
    } else if (
      this.dataSource?.data.length > this.maxGuesses - 1 ||
      this.gameState === this.GAME_STATE.LOSE
    ) {
      this.gameState = GAME_STATE.LOSE;
      this.openDialog();
      localStorage.setItem("currentStreak", "0");
      localStorage.setItem("gameState", this.GAME_STATE.LOSE);
      return;
    }
  }

  getDayDifference(
    oldDateString: string | number | Date,
    newDateString: string | number | Date
  ) {
    // Create Date objects from the date strings
    const oldDate = new Date(oldDateString);
    const newDate = new Date(newDateString);

    // Ensure these variables are Date objects
    if (isNaN(oldDate.getTime()) || isNaN(newDate.getTime())) {
      throw new Error("Invalid date strings");
    }

    // Extract only the date part (year, month, day)
    const oldDateOnly = new Date(
      oldDate.getFullYear(),
      oldDate.getMonth(),
      oldDate.getDate()
    );
    const newDateOnly = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate()
    );

    // Calculate the time difference in milliseconds
    const timeDifference = newDateOnly.getTime() - oldDateOnly.getTime();

    // Calculate the day difference by dividing the time difference by the number of milliseconds in a day
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return dayDifference;
  }

  extractSimilarValues(obj: PokemonStats) {
    let abilities: Abilities[] = [];
    if (
      this.compareArrays(
        obj.abilities,
        this.todaysPokemon.abilities,
        "pokemon_v2_ability",
        "name"
      ) === ArrayComparisonResult.Same
    ) {
      abilities = obj.abilities;
    }
    let egggroup: EggGroups[] = [];
    if (
      this.compareArrays(
        obj.egggroup,
        this.todaysPokemon.egggroup,
        "pokemon_v2_egggroup",
        "name"
      ) === ArrayComparisonResult.Same
    ) {
      egggroup = obj.egggroup;
    }
    const similarValues: PokemonStats = {
      displayName:
        this.todaysPokemon.name === obj.name ? this.todaysPokemon.name : "",
      name: this.todaysPokemon.name === obj.name ? this.todaysPokemon.name : "",
      image:
        this.todaysPokemon.image === obj.image ? this.todaysPokemon.image : "",
      type1:
        this.todaysPokemon.type1 === obj.type1 ? this.todaysPokemon.type1 : "",
      type2:
        this.todaysPokemon.type2 === obj.type2 ? this.todaysPokemon.type2 : "",
      color:
        this.todaysPokemon.color === obj.color ? this.todaysPokemon.color : "",
      abilities: abilities,
      egggroup: egggroup,
      weight:
        this.todaysPokemon.weight === obj.weight
          ? this.todaysPokemon.weight
          : 0,
      stats:
        this.todaysPokemon.stats === obj.stats ? this.todaysPokemon.stats : 0,
      species:
        this.todaysPokemon.species === obj.species
          ? this.todaysPokemon.species
          : "",
      description:
        this.todaysPokemon.description === obj.description
          ? this.todaysPokemon.description
          : "",
    };

    if (!this.correctlyGuessed.name && similarValues.name) {
      this.correctlyGuessed.name = similarValues.name;
    }
    if (!this.correctlyGuessed.image && similarValues.image) {
      this.correctlyGuessed.image = similarValues.image;
    }
    if (!this.correctlyGuessed.type1 && similarValues.type1) {
      this.correctlyGuessed.type1 = similarValues.type1;
    }
    if (!this.correctlyGuessed.type2 && similarValues.type2) {
      this.correctlyGuessed.type2 = similarValues.type2;
    }
    if (!this.correctlyGuessed.color && similarValues.color) {
      this.correctlyGuessed.color = similarValues.color;
    }
    if (!this.correctlyGuessed.weight && similarValues.weight) {
      this.correctlyGuessed.weight = similarValues.weight;
    }
    if (!this.correctlyGuessed.stats && similarValues.stats) {
      this.correctlyGuessed.stats = similarValues.stats;
    }
    if (!this.correctlyGuessed.species && similarValues.species) {
      this.correctlyGuessed.species = similarValues.species;
    }
    if (
      this.correctlyGuessed.abilities.length === 0 &&
      similarValues.abilities
    ) {
      this.correctlyGuessed.abilities = similarValues.abilities;
    }
    if (this.correctlyGuessed.egggroup.length === 0 && similarValues.egggroup) {
      this.correctlyGuessed.egggroup = similarValues.egggroup;
    }
    this.correctlyGuessed = { ...this.correctlyGuessed };
    localStorage.setItem(
      "correctlyGuessed",
      JSON.stringify(this.correctlyGuessed)
    );
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

  openDialog(): void {
    this.dialog.open(this.endDialog);
  }

  reloadPage() {
    location.reload();
  }

  onChildHover(pokemon: PokemonStats) {
    this.hoveredPokemon = pokemon;
  }

  onChildClick(pokemon: PokemonStats) {
    this.hoveredPokemon = pokemon;
    this.pokeInputControl.setValue(pokemon.name);
  }
}

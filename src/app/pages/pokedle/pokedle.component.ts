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
  name: string;
  image: string;
  type1: string;
  type2: string;
  color: string;
  abilities: [];
  egggroup: [];
  weight: number;
  stats: number;
  species: string;
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
    name: "",
    image: "",
    type1: "",
    type2: "",
    color: "",
    abilities: [],
    egggroup: [],
    weight: 0,
    stats: 0,
    species: ""
  };
  correctlyGuessed: PokemonStats = {
    name: "",
    image: "",
    type1: "",
    type2: "",
    color: "",
    abilities: [],
    egggroup: [],
    weight: 0,
    stats: 0,
    species: ""
  };
  hoveredPokemon: any;
  guesses = 0;
  maxGuesses = 10;
  loading = false;
  customColor = "red";

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
    this.getRandomPokemon();
    this.hoveredPokemon = this.createPokemonObj(this.allPokemon?.[0]);
  }

  async getPokemonByUrl(url: string) {
    this.loading = true;
    try {
      this.pokemonData = await firstValueFrom(
        this.pokeService.getPokemonByUrl(url)
      );
      let totalBaseStat = 0;
      this.pokemonData?.stats.forEach((stat: { base_stat: number }) => {
        totalBaseStat += stat.base_stat;
      });
      const pokemonEggData: any = await firstValueFrom(
        this.pokeService.getPokemonEgg(this.pokemonData?.species?.name)
      );
      this.todaysPokemon = {
        name: this.pokemonData.name,
        image: this.pokemonData?.sprites?.front_default,
        type1: this.pokemonData?.types[0],
        type2: this.pokemonData?.types[1],
        color: pokemonEggData?.color?.name,
        abilities: this.pokemonData?.abilities,
        egggroup: pokemonEggData?.egg_groups,
        weight: this.pokemonData?.weight / 10,
        stats: totalBaseStat,
        species: this.pokemonData?.pokemon_v2_pokemonspecy.name
      };
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
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
      species: pokemon?.pokemon_v2_pokemonspecy?.name
    };
    return pokemonObj;
  }

  getRandomPokemon() {
    let seed = parseInt(
      new Date().toISOString().split("T", 1)[0].replace(/\D/g, "")
    );
    var x = Math.sin(seed++) * 10000;
    const randomNum = Math.round(
      this.allPokemon?.length * Math.abs(x - Math.floor(x))
    ).toString();
    if (randomNum) {
      this.todaysPokemon = this.createPokemonObj(this.allPokemon?.[randomNum]);
    }
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
    if (this.loading || this.gameState === this.GAME_STATE.WIN) {
      return;
    }
    if (!this.pokeInputControl.value) {
      return;
    }
    if (
      this.maxGuesses - 1 < this.guesses ||
      this.gameState === this.GAME_STATE.LOSE
    ) {
      this.gameState = GAME_STATE.LOSE;
      this.openDialog();
      return;
    }
    let pokemon: { name: string } | undefined = undefined;

    const inputValue = this.pokeInputControl.value?.toLowerCase();
    
    if (inputValue) {
      pokemon = this.allPokemon?.find((p: { name: string }) =>
        p.name.toLowerCase() === inputValue
      );
    }
    if (!pokemon) {
      return;
    }
    this.guesses += 1;
    this.dataSource?.data.unshift(this.createPokemonObj(pokemon));
    this.dataSource._updateChangeSubscription();

    this.allPokemon = this.allPokemon.filter(
      (pokemonObj: { name: any }) => pokemonObj.name !== pokemon?.name
    );
    this.pokeInputControl.setValue("");
    if (pokemon?.name === this.todaysPokemon.name) {
      this.gameState = GAME_STATE.WIN;
      this.openDialog();
    } else if (
      this.dataSource?.data.length > this.maxGuesses - 1 ||
      this.gameState === this.GAME_STATE.LOSE
    ) {
      this.gameState = GAME_STATE.LOSE;
      this.openDialog();
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

  openDialog(): void {
    this.dialog.open(this.endDialog);
  }

  reloadPage() {
    location.reload();
  }

  onChildHover(pokemon: PokemonStats) {
    this.hoveredPokemon = pokemon;
  }
}

import { Component, TemplateRef, ViewChild } from "@angular/core";
import { PokeService } from "src/app/services/poke.service";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";

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
  type1: any;
  type2: any;
  color: string;
  abilities: [];
  egggroup: [];
  weight: number;
  stats: number;
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
  randomNum: string | undefined;
  todaysPokemon: PokemonStats = {
    name: "",
    image: "",
    type1: {},
    type2: {},
    color: "",
    abilities: [],
    egggroup: [],
    weight: 0,
    stats: 0,
  };
  maxGuesses = 10;
  loading = true;
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

  constructor(private pokeService: PokeService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.pokeInputControl.valueChanges.subscribe((newValue) => {
      this.onPokeInput();
    });
    await this.getAllPokemon();
    this.getRandomPokemon();
    if (this.randomNum) {
      await this.getPokemonByUrl(
        this.allPokemon?.results?.[this.randomNum]?.url
      );
    }
    // console.log(this.todaysPokemon);
  }

  async getPokemonByUrl(url: string) {
    this.loading = true;
    try {
      this.pokemonData = await this.pokeService
        .getPokemonByUrl(url)
        .toPromise();
      let totalBaseStat = 0;
      this.pokemonData?.stats.forEach((stat: { base_stat: number }) => {
        totalBaseStat += stat.base_stat;
      });
      const pokemonEggData: any = await this.pokeService
        .getPokemonEgg(this.pokemonData?.species?.name)
        .toPromise();
      this.todaysPokemon = {
        name: this.pokemonData.name,
        image: this.pokemonData?.sprites?.front_default,
        type1: this.pokemonData?.types[0],
        type2: this.pokemonData?.types[1],
        color: pokemonEggData?.color?.name,
        abilities: this.pokemonData?.abilities,
        egggroup: pokemonEggData?.egg_groups,
        weight: this.pokemonData?.weight/10,
        stats: totalBaseStat
      };
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }

  async guessPokemon(name: string) {
    this.loading = true;
    try {
      const pokemonData: any = await this.pokeService
        .getPokemonByName(name)
        .toPromise();
      console.log(pokemonData);
      let totalBaseStat = 0;
      pokemonData?.stats.forEach((stat: { base_stat: number }) => {
        totalBaseStat += stat.base_stat;
      });
      const pokemonEggData: any = await this.pokeService
        .getPokemonEgg(pokemonData?.species?.name)
        .toPromise();

      const pokemonObj: any = {
        name: pokemonData.name,
        image: pokemonData?.sprites?.front_default,
        type1: pokemonData?.types[0],
        type2: pokemonData?.types[1],
        color: pokemonEggData?.color?.name,
        abilities: pokemonData?.abilities,
        egggroup: pokemonEggData?.egg_groups,
        weight: pokemonData?.weight/10,
        stats: totalBaseStat,
      };

      this.loading = false;
      return pokemonObj;
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
    return;
  }

  async getAllPokemon() {
    this.loading = true;

    try {
      this.allPokemon = await this.pokeService.getAllPokemon().toPromise();
      // console.log(this.allPokemon);
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }

  getRandomPokemon() {
    let seed = parseInt(
      new Date().toISOString().split("T", 1)[0].replace(/\D/g, "")
    );
    var x = Math.sin(seed++) * 10000;
    this.randomNum = Math.round(
      this.allPokemon.count * Math.abs(x - Math.floor(x)) + 1
    ).toString();
  }

  // Make a better search later
  // Make just filter by the values entered counting the order
  onPokeInput() {
    this.suggestedPokemons = this.allPokemon?.results.filter(
      (val: { name: (string | undefined)[] }) =>
        val?.name.includes(this.pokeInputControl.value?.toLowerCase())
    );
  }

  async onSubmit(event: any) {
    event.preventDefault();
    if (this.loading || this.gameState === this.GAME_STATE.WIN) {
      return;
    }
    if (
      this.dataSource?.data.length > this.maxGuesses - 1 ||
      this.gameState === this.GAME_STATE.LOSE
    ) {
      this.gameState = GAME_STATE.LOSE;
      this.openDialog();
      return;
    }
    const temp = this.allPokemon?.results.filter(
      (val: { name: (string | undefined)[] }) =>
        val?.name.includes(this.pokeInputControl.value?.toLowerCase())
    );
    if (temp.length < 1) {
      return;
    }
    this.dataSource?.data.unshift(await this.guessPokemon(temp[0].name));
    this.dataSource._updateChangeSubscription();

    this.allPokemon.results = this.allPokemon.results.filter(
      (pokemonObj: { name: any }) => pokemonObj.name !== temp[0].name
    );
    this.pokeInputControl.setValue("");
    if (temp[0].name === this.todaysPokemon.name) {
      this.gameState = GAME_STATE.WIN;
      this.openDialog();
    }
    if (
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
}

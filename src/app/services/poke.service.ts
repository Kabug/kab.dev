import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

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

@Injectable({
  providedIn: "root",
})
export class PokeService {
  private apiUrl = "https://pokeapi.co/api/v2";
  constructor(private http: HttpClient) {}

  getPokemonByUrl(url: string) {
    return this.http.get(url);
  }

  getPokemonByName(name: string) {
    const url = `${this.apiUrl}/pokemon/${name}`;
    return this.http.get(url);
  }

  getPokemonByInfo(name: string) {
    const url = `${this.apiUrl}/characteristic/${name}`;
    return this.http.get(url);
  }

  getPokemonEgg(name: string) {
    const url = `${this.apiUrl}/pokemon-species/${name}`;
    return this.http.get(url);
  }

  getAllPokemon() {
    const url = `${this.apiUrl}/pokemon?limit=69420`;
    return this.http.get(url);
  }
}

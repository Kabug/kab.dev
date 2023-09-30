import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

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

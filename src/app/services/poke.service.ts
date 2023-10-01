import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { gql, Apollo } from "apollo-angular";
@Injectable({
  providedIn: "root",
})
export class PokeService {
  private apiUrl = "https://pokeapi.co/api/v2";
  constructor(private http: HttpClient, private apollo: Apollo) {}

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

  GQL_GET_ALL_POKEMON = gql`
    query samplePokeAPIquery {
      pokemon_v2_pokemon {
        height
        id
        name
        order
        pokemon_species_id
        weight
        pokemon_v2_pokemonstats {
          base_stat
        }
        pokemon_v2_pokemonsprites {
          id
          sprites
        }
        pokemon_v2_pokemonabilities {
          ability_id
          pokemon_id
          pokemon_v2_ability {
            name
          }
        }
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            name
          }
        }
        pokemon_v2_pokemonspecy {
          pokemon_v2_pokemoncolor {
            name
          }
          pokemon_v2_generation {
            id
            name
          }
          pokemon_v2_pokemonegggroups {
            pokemon_v2_egggroup {
              name
            }
          }
          pokemon_v2_pokemonshape {
            name
          }
          pokemon_v2_pokemonspeciesflavortexts(
            where: { language_id: { _eq: 9 } }
          ) {
            flavor_text
          }
        }
      }
    }
  `;

  getAllPokemonGQL() {
    // Use the Apollo client to query data.
    return this.apollo.query({
      query: this.GQL_GET_ALL_POKEMON,
    });
  }
}

import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule as MatInputModule } from "@angular/material/input";
import { MatFormFieldModule as MatFormFieldModule } from "@angular/material/form-field";
import { MatTableModule as MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { LayoutModule } from "@angular/cdk/layout";
import { MatDialogModule as MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { PokedleComponent } from "./pages/pokedle/pokedle.component";
import { PokemonCardComponent } from "./components/pokemon-card/pokemon-card.component";
import { GraphQLModule } from './graphql.module';

import { PokeService } from "./services/poke.service";

@NgModule({
  declarations: [AppComponent, PokedleComponent, PokemonCardComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LayoutModule,
    MatDialogModule,
    MatButtonModule,
    GraphQLModule,
    MatSlideToggleModule
  ],
  providers: [PokeService],
  bootstrap: [AppComponent],
})
export class AppModule {}

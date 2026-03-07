import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HttpClientModule],
  template: `
    <div class="app">
      <header>
        <h1>Gestion Ferme Avicole</h1>
        <nav>
          <a routerLink="/lots">Liste des lots</a>
          <a routerLink="/suivi-poids">Suivi poids</a>
          <a routerLink="/lots/nouveau">Nouveau lot</a>
          <a routerLink="/mortalite">Mortalité</a>
          <a routerLink="/prix-sakafo">Prix Sakafo</a>
          <a routerLink="/recensement-oeuf">Recensement Atody</a>
          <a routerLink="/transformation-oeuf">Transformation Atody</a>
          <a routerLink="/situation">SITUATION GLOBALE</a>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app {
      font-family: Arial, sans-serif;
    }
    header {
      background-color: #4CAF50;
      color: white;
      padding: 1rem;
    }
    nav {
      margin-top: 1rem;
    }
    nav a {
      color: white;
      margin-right: 1rem;
      text-decoration: none;
      font-weight: bold;
    }
    nav a:hover {
      text-decoration: underline;
    }
    main {
      padding: 2rem;
    }
  `]
})
export class App { }
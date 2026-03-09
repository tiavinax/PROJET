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
          <a routerLink="/lots">LOTS</a>
          <a routerLink="/races">RACES</a>
          <a routerLink="/suivi-poids">SUIVI POIDS</a>
          <a routerLink="/mortalite">MORTALITE</a>
          <a routerLink="/prix-sakafo">PRIX SAKAFO</a>
          <a routerLink="/prix-atody">PRIX ATODY</a>
          <a routerLink="/recensement-oeuf">RECENSEMENT</a>
          <a routerLink="/transformation-oeuf">INCUBATION</a>
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
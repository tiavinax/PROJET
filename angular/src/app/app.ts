import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HttpClientModule],
  template: `
    <div class="app">
      <header>
        <div class="header-top">
          <h1>Gestion Ferme Avicole</h1>
          <button class="btn-reinitialiser" (click)="reinitialiser()">
            🗑️ Réinitialiser
          </button>
        </div>
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
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-top h1 {
      margin: 0;
    }
    .btn-reinitialiser {
      background: #e53935;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .btn-reinitialiser:hover {
      background: #b71c1c;
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
export class App {

  constructor(private http: HttpClient) {}

  reinitialiser(): void {
    if (!confirm('⚠️ ATTENTION : Toutes les données seront supprimées définitivement.\n\nConfirmer la réinitialisation ?')) return;
    if (!confirm('Dernière confirmation — êtes-vous sûr ?')) return;

    this.http.post('http://localhost:3000/api/reinitialiser', {}).subscribe({
      next: () => {
        alert('✅ Base de données réinitialisée !');
        window.location.reload();
      },
      error: () => {
        alert('❌ Erreur lors de la réinitialisation');
      }
    });
  }
}
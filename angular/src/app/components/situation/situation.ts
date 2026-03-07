import { Component, OnInit, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { SituationLot } from '../../models/situation.model';
import { SituationService } from '../../services/situation.service';

registerLocaleData(localeFr);

@Component({
  selector: 'app-situation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './situation.html',
  styleUrls: ['./situation.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class Situation implements OnInit {

  // La date choisie par l'utilisateur — aujourd'hui par défaut
  dateFiltre: string = new Date().toISOString().split('T')[0];

  situationLots: SituationLot[] = [];
  isLoading = false;
  erreur = '';

  constructor(private situationService: SituationService, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.chargerSituation();
  }

  chargerSituation(): void {
    this.isLoading = true;
    this.erreur = '';

    this.situationService.getSituation(this.dateFiltre).subscribe({
      next: (response) => {
        if (response.success) {
          this.situationLots = response.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // Forcer la détection de changement après mise à jour des données
      },
      error: (err) => {
        this.erreur = 'Impossible de contacter le serveur';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Calculer le total bénéfice de tous les lots
  get totalBenefice(): number {
    return this.situationLots.reduce((sum, lot) => sum + lot.benefice, 0);
  }
}
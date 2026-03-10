import { Component, OnInit, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { SituationLot, SituationGlobale, SituationResponse } from '../../models/situation.model';
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

  dateFiltre: string = new Date().toISOString().split('T')[0];
  situationLots: SituationLot[] = [];
  globale?: SituationGlobale;  // ← nouveau
  isLoading = false;
  erreur = '';

  constructor(
    private situationService: SituationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerSituation();
  }

  chargerSituation(): void {
    this.isLoading = true;
    this.erreur = '';

    this.situationService.getSituation(this.dateFiltre).subscribe({
      next: (response: SituationResponse) => {
        if (response.success) {
          this.situationLots = response.data;
          this.globale = response.globale;  // ← nouveau
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erreur = 'Impossible de contacter le serveur';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
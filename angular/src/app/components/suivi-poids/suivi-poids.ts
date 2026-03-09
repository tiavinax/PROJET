import { Component, OnInit, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeFr from '@angular/common/locales/fr';
import { SuiviPoids } from '../../models/suivi-poids.model';
import { SuiviPoidsService } from '../../services/suivi-poids.service';
import { LotService } from '../../services/lot.service';

registerLocaleData(localeFr);

@Component({
  selector: 'app-suivi-poids',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suivi-poids.html',
  styleUrls: ['./suivi-poids.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class SuiviPoidsComponent implements OnInit {

  suivis: SuiviPoids[] = [];
  races: any[] = [];           // ← races au lieu de lots
  isLoading = false;
  erreur = '';
  raceIdFiltre: number | null = null;  // ← filtre par race

  showForm = false;
  isEditing = false;
  suiviEnCours: any = this.formVide();

  constructor(
    private suiviService: SuiviPoidsService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerRaces();
    this.chargerSuivis();
  }

  formVide() {
    return {
      id: null,
      race_id: null,                   // ← race_id
      semaine: null,                   // ← accepte 0 (date entrée poussin)
      poids_recueilli_grammes: null,
      sakafo_consomme_grammes: null
      // date_mesure supprimé !
    };
  }

  chargerRaces(): void {
    this.lotService.getRaces().subscribe({
      next: (response) => {
        if (response.success) this.races = response.data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  chargerSuivis(): void {
    this.isLoading = true;
    this.suiviService.getAll(this.raceIdFiltre ?? undefined).subscribe({
      next: (response) => {
        if (response.success) this.suivis = response.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrerParRace(): void {
    this.chargerSuivis();
  }

  ouvrirAjout(): void {
    this.isEditing = false;
    this.suiviEnCours = this.formVide();
    this.erreur = '';
    this.showForm = true;
  }

  ouvrirModif(suivi: SuiviPoids): void {
    this.isEditing = true;
    this.suiviEnCours = { ...suivi };
    this.erreur = '';
    this.showForm = true;
  }

  enregistrer(): void {
    // Validation — semaine 0 est valide !
    if (!this.suiviEnCours.race_id) {
      this.erreur = 'Race obligatoire';
      this.cdr.detectChanges();
      return;
    }

    if (this.suiviEnCours.semaine === null || 
        this.suiviEnCours.semaine === undefined ||
        this.suiviEnCours.semaine === '') {
      this.erreur = 'Semaine obligatoire (0 = date entrée poussin)';
      this.cdr.detectChanges();
      return;
    }

    if (!this.suiviEnCours.poids_recueilli_grammes) {
      this.erreur = 'Poids obligatoire';
      this.cdr.detectChanges();
      return;
    }

    if (this.suiviEnCours.sakafo_consomme_grammes === null ||
        this.suiviEnCours.sakafo_consomme_grammes === undefined) {
      this.erreur = 'Sakafo obligatoire (0 si semaine 0)';
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    if (this.isEditing) {
      this.suiviService.update(this.suiviEnCours.id, this.suiviEnCours).subscribe({
        next: (response) => {
          if (response.success) {
            this.showForm = false;
            this.chargerSuivis();
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.erreur = 'Erreur modification';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.suiviService.create(this.suiviEnCours).subscribe({
        next: (response) => {
          if (response.success) {
            this.showForm = false;
            this.chargerSuivis();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erreur = err.error?.message || 'Erreur création';
          this.cdr.detectChanges();
        }
      });
    }
  }

  supprimer(id: number): void {
    if (confirm('Supprimer ce suivi ?')) {
      this.suiviService.delete(id).subscribe({
        next: () => {
          this.chargerSuivis();
          this.cdr.detectChanges();
        },
        error: () => {
          this.erreur = 'Erreur suppression';
          this.cdr.detectChanges();
        }
      });
    }
  }

  annuler(): void {
    this.showForm = false;
    this.erreur = '';
  }

  // Poids cumulé — seulement pour la même race
  getPoidsTotal(index: number): number {
    const raceId = this.suivis[index].race_id;
    return this.suivis
      .slice(0, index + 1)
      .filter(s => s.race_id === raceId)
      .reduce((sum, s) => sum + s.poids_recueilli_grammes, 0);
  }
}

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
  lots: any[] = [];
  isLoading = false;
  erreur = '';
  lotIdFiltre: number | null = null;

  // Formulaire ajout/modif
  showForm = false;
  isEditing = false;
  suiviEnCours: any = this.formVide();

  constructor(
    private suiviService: SuiviPoidsService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerLots();
    this.chargerSuivis();
  }

  // Formulaire vide par défaut
  formVide() {
    return {
      id: null,
      lot_id: null,
      semaine: null,
      date_mesure: '',
      poids_recueilli_grammes: null,
      sakafo_consomme_grammes: null
    };
  }

  chargerLots(): void {
    this.lotService.getLots().subscribe({
      next: (response) => {
        if (response.success) this.lots = response.data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  chargerSuivis(): void {
    this.isLoading = true;
    this.suiviService.getAll(this.lotIdFiltre ?? undefined).subscribe({
      next: (response) => {
        if (response.success) this.suivis = response.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erreur = 'Erreur lors du chargement';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filtrer par lot
  filtrerParLot(): void {
    this.chargerSuivis();
  }

  // Ouvrir formulaire ajout
  ouvrirAjout(): void {
    this.isEditing = false;
    this.suiviEnCours = this.formVide();
    this.showForm = true;
  }

  // Ouvrir formulaire modification
  ouvrirModif(suivi: SuiviPoids): void {
    this.isEditing = true;
    this.suiviEnCours = { ...suivi };   // copie pour ne pas modifier la liste
    this.showForm = true;
  }

  // Enregistrer (ajout ou modif)
  enregistrer(): void {
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

  // Calculer poids cumulé jusqu'à une ligne
  getPoidsTotal(index: number): number {
    return this.suivis
      .slice(0, index + 1)
      .reduce((sum, s) => sum + s.poids_recueilli_grammes, 0);
  }
}
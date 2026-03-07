import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrixSakafo } from '../../models/prix-sakafo.model';
import { PrixSakafoService } from '../../services/prix-sakafo.service';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-prix-sakafo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prix-sakafo.html',
  styleUrls: ['./prix-sakafo.css']
})
export class PrixSakafoComponent implements OnInit {

  prixList: PrixSakafo[] = [];
  races: any[] = [];
  isLoading = false;
  erreur = '';

  showForm = false;
  isEditing = false;
  // Pour création
  formAjout: any = { race_id: null, prix_par_gramme: null };
  // Pour modification — on édite directement dans le tableau
  prixEnCoursId: number | null = null;
  prixEnCourValeur: number | null = null;

  constructor(
    private prixSakafoService: PrixSakafoService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerRaces();
    this.chargerPrix();
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

  chargerPrix(): void {
    this.isLoading = true;
    this.prixSakafoService.getAll().subscribe({
      next: (response) => {
        if (response.success) this.prixList = response.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur chargement';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Ouvrir formulaire ajout nouvelle race
  ouvrirAjout(): void {
    this.formAjout = { race_id: null, prix_par_gramme: null };
    this.erreur = '';
    this.showForm = true;
  }

  // Créer nouveau prix
  creer(): void {
    if (!this.formAjout.race_id || !this.formAjout.prix_par_gramme) {
      this.erreur = 'Race et prix obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.prixSakafoService.create(this.formAjout).subscribe({
      next: (response) => {
        if (response.success) { this.showForm = false; this.chargerPrix(); }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Erreur création';
        this.cdr.detectChanges();
      }
    });
  }

  // Activer modification inline dans le tableau
  ouvrirModif(prix: PrixSakafo): void {
    this.prixEnCoursId = prix.id;
    this.prixEnCourValeur = prix.prix_par_gramme;
    this.erreur = '';
    this.cdr.detectChanges();
  }

  // Sauvegarder modification inline
  sauvegarderModif(id: number): void {
    if (!this.prixEnCourValeur || this.prixEnCourValeur <= 0) {
      this.erreur = 'Prix invalide';
      this.cdr.detectChanges();
      return;
    }

    this.prixSakafoService.update(id, { prix_par_gramme: this.prixEnCourValeur }).subscribe({
      next: (response) => {
        if (response.success) {
          this.prixEnCoursId = null;
          this.chargerPrix();
        }
        this.cdr.detectChanges();
      },
      error: () => { this.erreur = 'Erreur modification'; this.cdr.detectChanges(); }
    });
  }

  annulerModif(): void { this.prixEnCoursId = null; }
  annuler(): void { this.showForm = false; this.erreur = ''; }
}
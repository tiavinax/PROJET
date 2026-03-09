import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrixAtody } from '../../models/prix-atody.model';
import { PrixAtodyService } from '../../services/prix-atody.service';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-prix-atody',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prix-atody.html',
  styleUrls: ['./prix-atody.css']
})
export class PrixAtodyComponent implements OnInit {

  prixList: PrixAtody[] = [];
  races: any[] = [];
  isLoading = false;
  erreur = '';

  showForm = false;
  formAjout: any = this.formVide();

  // Modification inline
  prixEnCoursId: number | null = null;
  prixEnCoursValeur: number | null = null;
  dateEnCoursValeur: string = '';

  constructor(
    private prixAtodyService: PrixAtodyService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerRaces();
    this.chargerPrix();
  }

  formVide() {
    return {
      race_id: null,
      prix_unitaire: null,
      date: new Date().toISOString().split('T')[0]  // aujourd'hui par défaut
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

  chargerPrix(): void {
    this.isLoading = true;
    this.prixAtodyService.getAll().subscribe({
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

  ouvrirAjout(): void {
    this.formAjout = this.formVide();
    this.erreur = '';
    this.showForm = true;
  }

  creer(): void {
    if (!this.formAjout.race_id || !this.formAjout.prix_unitaire) {
      this.erreur = 'Race et prix obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.prixAtodyService.create(this.formAjout).subscribe({
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

  ouvrirModif(prix: PrixAtody): void {
    this.prixEnCoursId     = prix.id;
    this.prixEnCoursValeur = prix.prix_unitaire;
    this.dateEnCoursValeur = prix.date ? prix.date.split('T')[0] : '';
    this.erreur = '';
    this.cdr.detectChanges();
  }

  sauvegarderModif(id: number): void {
    if (!this.prixEnCoursValeur || this.prixEnCoursValeur <= 0) {
      this.erreur = 'Prix invalide';
      this.cdr.detectChanges();
      return;
    }

    this.prixAtodyService.update(id, {
      prix_unitaire: this.prixEnCoursValeur,
      date: this.dateEnCoursValeur
    }).subscribe({
      next: (response) => {
        if (response.success) { this.prixEnCoursId = null; this.chargerPrix(); }
        this.cdr.detectChanges();
      },
      error: () => { this.erreur = 'Erreur modification'; this.cdr.detectChanges(); }
    });
  }

  supprimer(id: number): void {
    if (confirm('Supprimer ce prix atody ?')) {
      this.prixAtodyService.delete(id).subscribe({
        next: () => { this.chargerPrix(); this.cdr.detectChanges(); },
        error: () => { this.erreur = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  annulerModif(): void { this.prixEnCoursId = null; }
  annuler(): void { this.showForm = false; this.erreur = ''; }
}
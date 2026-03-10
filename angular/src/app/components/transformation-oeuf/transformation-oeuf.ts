import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransformationOeufService } from '../../services/transformation-oeuf.service';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-transformation-oeuf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transformation-oeuf.html',
  styleUrls: ['./transformation-oeuf.css']
})
export class TransformationOeufComponent implements OnInit {

  transformations: any[] = [];
  lots: any[] = [];
  recensementsDisponibles: any[] = [];  // ← recensements du lot choisi
  isLoading = false;
  erreur = '';

  showForm = false;
  form: any = this.formVide();

  raceNomSource = '';
  stockRestantRecensement = 0;  // ← stock du recensement choisi
  nombrePerte = 0;

  constructor(
    private transformationService: TransformationOeufService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerLots();
    this.chargerTransformations();
  }

  formVide() {
    return {
      lot_source_id: null,
      recensement_source_id: null,   // ← nouveau
      date_transformation: '',
      nombre_oeufs: null,
      nombre_poussins_obtenus: null,
      age_entree_semaines: 0,
      prix_achat_total_nouveau_lot: 0
    };
  }

  chargerLots(): void {
    this.lotService.getLots().subscribe({
      next: (r) => { if (r.success) this.lots = r.data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  chargerTransformations(): void {
    this.isLoading = true;
    this.transformationService.getAll().subscribe({
      next: (r) => {
        if (r.success) this.transformations = r.data;
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

  // Étape 1 — Choisir le lot source
  onLotSourceChange(): void {
    this.form.recensement_source_id = null;
    this.recensementsDisponibles = [];
    this.stockRestantRecensement = 0;
    this.raceNomSource = '';
    this.form.nombre_oeufs = null;

    if (!this.form.lot_source_id) return;

    // Race du lot source
    const lotSource = this.lots.find(l => l.id == this.form.lot_source_id);
    if (lotSource) this.raceNomSource = lotSource.race_nom;

    // Charger les recensements disponibles du lot
    this.transformationService.getRecensementsDisponibles(this.form.lot_source_id).subscribe({
      next: (r) => {
        if (r.success) this.recensementsDisponibles = r.data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur chargement recensements';
        this.cdr.detectChanges();
      }
    });
  }

  // Étape 2 — Choisir le recensement
  onRecensementChange(): void {
    this.form.nombre_oeufs = null;
    this.stockRestantRecensement = 0;

    if (!this.form.recensement_source_id) return;

    const rec = this.recensementsDisponibles.find(
      r => r.id == this.form.recensement_source_id
    );
    if (rec) {
      this.stockRestantRecensement = rec.stock_restant;
      // Pré-remplir la date avec la date du recensement
      if (!this.form.date_transformation) {
        this.form.date_transformation = rec.date_recensement?.split('T')[0] || '';
      }
    }
    this.cdr.detectChanges();
  }

  calculerPerte(): void {
    const oeufs    = this.form.nombre_oeufs || 0;
    const poussins = this.form.nombre_poussins_obtenus || 0;
    this.nombrePerte = oeufs - poussins;
  }

  ouvrirAjout(): void {
    this.form = this.formVide();
    this.recensementsDisponibles = [];
    this.stockRestantRecensement = 0;
    this.raceNomSource = '';
    this.nombrePerte = 0;
    this.erreur = '';
    this.showForm = true;
  }

  enregistrer(): void {
    if (!this.form.lot_source_id || !this.form.recensement_source_id ||
        !this.form.date_transformation || !this.form.nombre_oeufs ||
        !this.form.nombre_poussins_obtenus) {
      this.erreur = 'Tous les champs obligatoires doivent être remplis';
      this.cdr.detectChanges();
      return;
    }

    if (this.form.nombre_poussins_obtenus > this.form.nombre_oeufs) {
      this.erreur = 'Poussins obtenus ne peut pas dépasser les œufs utilisés';
      this.cdr.detectChanges();
      return;
    }

    if (this.form.nombre_oeufs > this.stockRestantRecensement) {
      this.erreur = `Stock insuffisant : seulement ${this.stockRestantRecensement} œufs disponibles`;
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    this.transformationService.create(this.form).subscribe({
      next: (r) => {
        if (r.success) {
          this.showForm = false;
          this.chargerTransformations();
          this.chargerLots();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Erreur création';
        this.cdr.detectChanges();
      }
    });
  }

  supprimer(id: number): void {
    if (confirm('Annuler cette transformation ? Le lot destination sera supprimé.')) {
      this.transformationService.delete(id).subscribe({
        next: () => { this.chargerTransformations(); this.chargerLots(); this.cdr.detectChanges(); },
        error: () => { this.erreur = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  annuler(): void {
    this.showForm = false;
    this.erreur = '';
  }
}
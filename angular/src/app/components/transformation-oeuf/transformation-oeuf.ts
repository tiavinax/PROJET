import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransformationOeuf } from '../../models/transformation-oeuf.model';
import { TransformationOeufService } from '../../services/transformation-oeuf.service';
import { RecensementOeufService } from '../../services/recensement-oeuf.service';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-transformation-oeuf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transformation-oeuf.html',
  styleUrls: ['./transformation-oeuf.css']
})
export class TransformationOeufComponent implements OnInit {

  transformations: TransformationOeuf[] = [];
  lots: any[] = [];
  isLoading = false;
  erreur = '';

  // Formulaire
  showForm = false;
  form: any = this.formVide();

  // Infos calculées en temps réel
  stockAtodyDisponible = 0;   // atody disponibles dans le lot source
  raceNomSource = '';          // race du lot source — readonly
  nombrePerte = 0;             // calculé automatiquement

  constructor(
    private transformationService: TransformationOeufService,
    private recensementService: RecensementOeufService,
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
      date_transformation: '',
      nombre_oeufs: null,
      nombre_poussins_obtenus: null,
      age_entree_semaines: 0,
      prix_achat_total_nouveau_lot: 0
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

  chargerTransformations(): void {
    this.isLoading = true;
    this.transformationService.getAll().subscribe({
      next: (response) => {
        if (response.success) this.transformations = response.data;
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

  // Appelé quand l'utilisateur choisit un lot source
  onLotSourceChange(): void {
    if (!this.form.lot_source_id) {
      this.stockAtodyDisponible = 0;
      this.raceNomSource = '';
      return;
    }

    // Récupérer la race du lot source
    const lotSource = this.lots.find(l => l.id == this.form.lot_source_id);
    if (lotSource) {
      this.raceNomSource = lotSource.race_nom;
    }

    // Récupérer le stock atody disponible
    const dateFiltre = new Date().toISOString().split('T')[0];
    this.recensementService.getAll(this.form.lot_source_id).subscribe({
      next: (response) => {
        if (response.success) {
          // Sommer tous les recensements (y compris les négatifs)
          this.stockAtodyDisponible = response.data.reduce(
            (sum: number, r: any) => sum + r.nombre_oeufs, 0
          );
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // Calculer la perte en temps réel
  calculerPerte(): void {
    const oeufs = this.form.nombre_oeufs || 0;
    const poussins = this.form.nombre_poussins_obtenus || 0;
    this.nombrePerte = oeufs - poussins;
  }

  ouvrirAjout(): void {
    this.form = this.formVide();
    this.stockAtodyDisponible = 0;
    this.raceNomSource = '';
    this.nombrePerte = 0;
    this.erreur = '';
    this.showForm = true;
  }

  enregistrer(): void {
    // Validation
    if (!this.form.lot_source_id || !this.form.date_transformation ||
        !this.form.nombre_oeufs || !this.form.nombre_poussins_obtenus) {
      this.erreur = 'Tous les champs obligatoires doivent être remplis';
      this.cdr.detectChanges();
      return;
    }

    if (this.form.nombre_poussins_obtenus > this.form.nombre_oeufs) {
      this.erreur = 'Poussins obtenus ne peut pas dépasser les œufs utilisés';
      this.cdr.detectChanges();
      return;
    }

    if (this.form.nombre_oeufs > this.stockAtodyDisponible) {
      this.erreur = `Stock insuffisant : seulement ${this.stockAtodyDisponible} atody disponibles`;
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    this.transformationService.create(this.form).subscribe({
      next: (response) => {
        if (response.success) {
          this.showForm = false;
          this.chargerTransformations();
          this.chargerLots(); // Recharger car nouveau lot créé
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
        next: () => {
          this.chargerTransformations();
          this.chargerLots();
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
}
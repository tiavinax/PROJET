import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecensementOeufService } from '../../services/recensement-oeuf.service';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-recensement-oeuf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recensement-oeuf.html',
  styleUrls: ['./recensement-oeuf.css']
})
export class RecensementOeufComponent implements OnInit {

  recensements: any[] = [];
  lots: any[] = [];
  isLoading = false;
  erreur = '';
  lotIdFiltre: number | null = null;

  showForm = false;
  isEditing = false;
  recensementEnCours: any = this.formVide();

  // Aperçu incubation
  nb_lamokany           = 0;
  oeufs_valides         = 0;
  date_incubation: Date | null = null;
  duree_incubation_race = 0;
  pourcentage_vavy_race = 0;
  pourcentage_lahy_race = 0;
  nb_vavy_attendus      = 0;
  nb_lahy_attendus      = 0;

  constructor(
    private recensementService: RecensementOeufService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerLots();
    this.chargerRecensements();
  }

  formVide() {
    return {
      id: null,
      lot_id: null,
      date_recensement: '',
      nombre_oeufs: null,
      pourcentage_lamokany: 0
    };
  }

  chargerLots(): void {
    this.lotService.getLots().subscribe({
      next: (r) => { if (r.success) this.lots = r.data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  chargerRecensements(): void {
    this.isLoading = true;
    this.recensementService.getAll(this.lotIdFiltre ?? undefined).subscribe({
      next: (r) => {
        if (r.success) this.recensements = r.data;
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

  filtrerParLot(): void {
    this.chargerRecensements();
  }

  // Quand on change de lot — charger les infos de la race
  onLotChange(): void {
    this.reinitialiserApercu();
    if (!this.recensementEnCours.lot_id) return;

    const lot = this.lots.find(l => l.id == this.recensementEnCours.lot_id);
    if (lot) {
      this.duree_incubation_race = lot.duree_incubation    || 0;
      this.pourcentage_vavy_race = lot.pourcentage_vavy    || 0;
      this.pourcentage_lahy_race = lot.pourcentage_lahy    || 0;
    }
    this.calculerApercu();
  }

  calculerApercu(): void {
    const nb     = Number(this.recensementEnCours.nombre_oeufs)         || 0;
    const pctLam = Number(this.recensementEnCours.pourcentage_lamokany) || 0;
    const date   = this.recensementEnCours.date_recensement;

    this.nb_lamokany   = Math.round(nb * pctLam / 100);
    this.oeufs_valides = nb - this.nb_lamokany;

    // Date incubation = date recensement + duree_incubation
    if (date && this.duree_incubation_race > 0) {
      const d = new Date(date + 'T00:00:00');
      d.setDate(d.getDate() + this.duree_incubation_race);
      this.date_incubation = d;
    } else {
      this.date_incubation = null;
    }

    // Vavy / Lahy attendus
    this.nb_vavy_attendus = Math.round(this.oeufs_valides * this.pourcentage_vavy_race / 100);
    this.nb_lahy_attendus = Math.round(this.oeufs_valides * this.pourcentage_lahy_race / 100);

    this.cdr.detectChanges();
  }

  reinitialiserApercu(): void {
    this.nb_lamokany           = 0;
    this.oeufs_valides         = 0;
    this.date_incubation       = null;
    this.duree_incubation_race = 0;
    this.pourcentage_vavy_race = 0;
    this.pourcentage_lahy_race = 0;
    this.nb_vavy_attendus      = 0;
    this.nb_lahy_attendus      = 0;
  }

  ouvrirAjout(): void {
    this.isEditing = false;
    this.recensementEnCours = this.formVide();
    this.reinitialiserApercu();
    this.erreur = '';
    this.showForm = true;
  }

  ouvrirModif(r: any): void {
    this.isEditing = true;
    this.recensementEnCours = {
      ...r,
      date_recensement: r.date_recensement?.split('T')[0] || ''
    };
    this.reinitialiserApercu();
    this.erreur = '';
    this.showForm = true;
  }

  enregistrer(): void {
    if (!this.recensementEnCours.lot_id ||
        !this.recensementEnCours.date_recensement ||
        !this.recensementEnCours.nombre_oeufs) {
      this.erreur = 'Lot, date et nombre d\'œufs obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    if (this.isEditing) {
      this.recensementService.update(this.recensementEnCours.id, this.recensementEnCours).subscribe({
        next: (r) => {
          if (r.success) { this.showForm = false; this.chargerRecensements(); }
          this.cdr.detectChanges();
        },
        error: () => { this.erreur = 'Erreur modification'; this.cdr.detectChanges(); }
      });
    } else {
      this.recensementService.create(this.recensementEnCours).subscribe({
        next: (r) => {
          if (r.success) {
            this.showForm = false;
            this.chargerRecensements();
            // Informer l'utilisateur du lot créé
            if (r.incubation) {
              alert(`✅ Recensement enregistré !\n\nIncubation planifiée :\n- Date : ${r.incubation.date_incubation_str}\n- Poussins attendus : ${r.incubation.nb_vavy + r.incubation.nb_lahy}\n  dont Vavy : ${r.incubation.nb_vavy}\n  dont Lahy : ${r.incubation.nb_lahy}`);
            }
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
    if (confirm('Supprimer ce recensement ?')) {
      this.recensementService.delete(id).subscribe({
        next: () => { this.chargerRecensements(); this.cdr.detectChanges(); },
        error: () => { this.erreur = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  annuler(): void {
    this.showForm = false;
    this.erreur = '';
  }

  // Totaux pour le tfoot
  get totalOeufs(): number {
    return this.recensements
      .filter(r => r.nombre_oeufs > 0)
      .reduce((sum, r) => sum + r.nombre_oeufs, 0);
  }

  get totalLamokany(): number {
    return this.recensements.reduce((sum, r) => sum + (r.nb_lamokany || 0), 0);
  }

  get totalValides(): number {
    return this.recensements.reduce((sum, r) => sum + (r.oeufs_valides || 0), 0);
  }
}
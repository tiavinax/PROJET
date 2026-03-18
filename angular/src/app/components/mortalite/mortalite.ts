import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mortalite } from '../../models/mortalite.model';
import { MortaliteService } from '../../services/mortalite.service';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-mortalite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mortalite.html',
  styleUrls: ['./mortalite.css']
})
export class MortaliteComponent implements OnInit {

  mortalites: Mortalite[] = [];
  lots: any[] = [];
  isLoading = false;
  erreur = '';
  lotIdFiltre: number | null = null;

  showForm = false;
  isEditing = false;
  mortaliteEnCours: any = this.formVide();

  // Aperçu temps réel
  nb_vavy_morts = 0;
  nb_lahy_morts = 0;

  constructor(
    private mortaliteService: MortaliteService,
    private lotService: LotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerLots();
    this.chargerMortalites();
  }

  formVide() {
    return {
      id: null,
      lot_id: null,
      date_mortalite: '',
      nombre_morts: null,
      pourcentage_vavy: 50,  // ← défaut 50/50
      pourcentage_lahy: 50
    };
  }

  // Synchronisation vavy ↔ lahy
  onVavyChange(): void {
    this.mortaliteEnCours.pourcentage_lahy =
      100 - (this.mortaliteEnCours.pourcentage_vavy || 0);
    this.calculerApercu();
  }

  onLahyChange(): void {
    this.mortaliteEnCours.pourcentage_vavy =
      100 - (this.mortaliteEnCours.pourcentage_lahy || 0);
    this.calculerApercu();
  }

  calculerApercu(): void {
    const nb   = Number(this.mortaliteEnCours.nombre_morts)     || 0;
    const pctV = Number(this.mortaliteEnCours.pourcentage_vavy) || 0;
    const pctL = Number(this.mortaliteEnCours.pourcentage_lahy) || 0;
    this.nb_vavy_morts = Math.round(nb * pctV / 100);
    this.nb_lahy_morts = Math.round(nb * pctL / 100);
    this.cdr.detectChanges();
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

  chargerMortalites(): void {
    this.isLoading = true;
    this.mortaliteService.getAll(this.lotIdFiltre ?? undefined).subscribe({
      next: (response) => {
        if (response.success) this.mortalites = response.data;
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

  filtrerParLot(): void { this.chargerMortalites(); }

  ouvrirAjout(): void {
    this.isEditing = false;
    this.mortaliteEnCours = this.formVide();
    this.nb_vavy_morts = 0;
    this.nb_lahy_morts = 0;
    this.erreur = '';
    this.showForm = true;
  }

  ouvrirModif(mortalite: Mortalite): void {
    this.isEditing = true;
    this.mortaliteEnCours = { ...mortalite };
    // Recalculer l'aperçu avec les valeurs existantes
    this.calculerApercu();
    this.erreur = '';
    this.showForm = true;
  }

  enregistrer(): void {
    if (!this.mortaliteEnCours.lot_id ||
        !this.mortaliteEnCours.date_mortalite ||
        !this.mortaliteEnCours.nombre_morts) {
      this.erreur = 'Lot, date et nombre de morts obligatoires';
      this.cdr.detectChanges();
      return;
    }

    // Validation pourcentage
    const total = (this.mortaliteEnCours.pourcentage_vavy || 0) +
                  (this.mortaliteEnCours.pourcentage_lahy || 0);
    if (total !== 100) {
      this.erreur = `% vavy + % lahy doit égaler 100 (actuellement ${total})`;
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    if (this.isEditing) {
      this.mortaliteService.update(this.mortaliteEnCours.id, this.mortaliteEnCours).subscribe({
        next: (response) => {
          if (response.success) {
            this.showForm = false;
            this.chargerMortalites();
          }
          this.cdr.detectChanges();
        },
        error: () => { this.erreur = 'Erreur modification'; this.cdr.detectChanges(); }
      });
    } else {
      this.mortaliteService.create(this.mortaliteEnCours).subscribe({
        next: (response) => {
          if (response.success) {
            this.showForm = false;
            this.chargerMortalites();
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
    if (confirm('Supprimer cette déclaration de mortalité ?')) {
      this.mortaliteService.delete(id).subscribe({
        next: () => { this.chargerMortalites(); this.cdr.detectChanges(); },
        error: () => { this.erreur = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  annuler(): void {
    this.showForm = false;
    this.erreur = '';
    this.nb_vavy_morts = 0;
    this.nb_lahy_morts = 0;
  }

  // Totaux pour tfoot
  get totalMorts(): number {
    return this.mortalites.reduce((sum, m) => sum + m.nombre_morts, 0);
  }

  get totalVavyMortes(): number {
    return this.mortalites.reduce((sum, m) => sum + (m.nb_vavy_morts || 0), 0);
  }

  get totalLahyMorts(): number {
    return this.mortalites.reduce((sum, m) => sum + (m.nb_lahy_morts || 0), 0);
  }
}
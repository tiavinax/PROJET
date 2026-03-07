import { Component, OnInit, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeFr from '@angular/common/locales/fr';
import { RecensementOeuf } from '../../models/recensement-oeuf.model';
import { RecensementOeufService } from '../../services/recensement-oeuf.service';
import { LotService } from '../../services/lot.service';

registerLocaleData(localeFr);

@Component({
  selector: 'app-recensement-oeuf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recensement-oeuf.html',
  styleUrls: ['./recensement-oeuf.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class RecensementOeufComponent implements OnInit {

  recensements: RecensementOeuf[] = [];
  lots: any[] = [];
  isLoading = false;
  erreur = '';
  lotIdFiltre: number | null = null;

  // Formulaire
  showForm = false;
  isEditing = false;
  recensementEnCours: any = this.formVide();

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
      nombre_oeufs: null
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

  chargerRecensements(): void {
    this.isLoading = true;
    this.recensementService.getAll(this.lotIdFiltre ?? undefined).subscribe({
      next: (response) => {
        if (response.success) this.recensements = response.data;
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

  ouvrirAjout(): void {
    this.isEditing = false;
    this.recensementEnCours = this.formVide();
    this.showForm = true;
    this.erreur = '';
  }

  ouvrirModif(recensement: RecensementOeuf): void {
    this.isEditing = true;
    this.recensementEnCours = { ...recensement };
    this.showForm = true;
    this.erreur = '';
  }

  enregistrer(): void {
    // Validation
    if (!this.recensementEnCours.lot_id ||
        !this.recensementEnCours.date_recensement ||
        !this.recensementEnCours.nombre_oeufs) {
      this.erreur = 'Tous les champs sont obligatoires';
      this.cdr.detectChanges();
      return;
    }

    if (this.isEditing) {
      this.recensementService.update(this.recensementEnCours.id, this.recensementEnCours).subscribe({
        next: (response) => {
          if (response.success) {
            this.showForm = false;
            this.chargerRecensements();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erreur = err.error?.message || 'Erreur modification';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.recensementService.create(this.recensementEnCours).subscribe({
        next: (response) => {
          if (response.success) {
            this.showForm = false;
            this.chargerRecensements();
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
        next: () => {
          this.chargerRecensements();
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

  // Total oeufs du lot filtré
  get totalOeufs(): number {
    return this.recensements.reduce((sum, r) => sum + r.nombre_oeufs, 0);
  }
}
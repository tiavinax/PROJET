import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Race } from '../../models/race.model';
import { RaceService } from '../../services/race.service';

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './race.html',
  styleUrls: ['./race.css']
})
export class RaceComponent implements OnInit {

  races: Race[] = [];
  isLoading = false;
  erreur = '';
  showForm = false;
  isEditing = false;
  raceEnCours: any = this.formVide();

  constructor(private raceService: RaceService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.chargerRaces(); }

  formVide() {
    return {
      id: null,
      nom: '',
      prix_vente_gramme:   null,
      prix_vente_kg:       null,
      prix_achat_unitaire: null,
      pourcentage_vavy:    50,
      pourcentage_lahy:    50,
      duree_incubation:    21,
      capacite_pondation:  0
    };
  }

  // Synchroniser lahy quand vavy change
  onVavyChange(): void {
    this.raceEnCours.pourcentage_lahy = 100 - (this.raceEnCours.pourcentage_vavy || 0);
  }

  // Synchroniser vavy quand lahy change
  onLahyChange(): void {
    this.raceEnCours.pourcentage_vavy = 100 - (this.raceEnCours.pourcentage_lahy || 0);
  }

  chargerRaces(): void {
    this.isLoading = true;
    this.raceService.getAll().subscribe({
      next: (r) => {
        if (r.success) this.races = r.data;
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
    this.isEditing = false;
    this.raceEnCours = this.formVide();
    this.erreur = '';
    this.showForm = true;
  }

  ouvrirModif(race: Race): void {
    this.isEditing = true;
    this.raceEnCours = { ...race };
    this.erreur = '';
    this.showForm = true;
  }

  enregistrer(): void {
    if (!this.raceEnCours.nom || !this.raceEnCours.prix_vente_gramme) {
      this.erreur = 'Nom et prix vente (Ar/g) obligatoires';
      this.cdr.detectChanges();
      return;
    }

    if ((this.raceEnCours.pourcentage_vavy + this.raceEnCours.pourcentage_lahy) !== 100) {
      this.erreur = 'Pourcentage vavy + lahy doit égaler 100%';
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    if (this.isEditing) {
      this.raceService.update(this.raceEnCours.id, this.raceEnCours).subscribe({
        next: (r) => {
          if (r.success) { this.showForm = false; this.chargerRaces(); }
          this.cdr.detectChanges();
        },
        error: () => { this.erreur = 'Erreur modification'; this.cdr.detectChanges(); }
      });
    } else {
      this.raceService.create(this.raceEnCours).subscribe({
        next: (r) => {
          if (r.success) { this.showForm = false; this.chargerRaces(); }
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
    if (confirm('Supprimer cette race ?')) {
      this.raceService.delete(id).subscribe({
        next: () => { this.chargerRaces(); this.cdr.detectChanges(); },
        error: () => { this.erreur = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  annuler(): void { this.showForm = false; this.erreur = ''; }
}
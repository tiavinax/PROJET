import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { LotService } from '../../services/lot.service';

@Component({
  selector: 'app-lot-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lot-form.html',
  styleUrls: ['./lot-form.css']
})
export class LotForm implements OnInit {

  lot: any = this.formVide();
  races: any[] = [];
  isEditing = false;
  isLoading = false;
  erreur = '';
  succes = '';

  constructor(
    private lotService: LotService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerRaces();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.chargerLot(Number(id));
    }
  }

  formVide() {
    return {
      date_entree:         '',
      nombre_initial:      null,
      race_id:             null,
      age_entree_semaines: 0,
      prix_achat_total:    null,
      sexe:                'mixte',   // ← nouveau
      pourcentage_sexe:    100        // ← nouveau
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

  chargerLot(id: number): void {
    this.isLoading = true;
    this.lotService.getLot(id).subscribe({
      next: (response) => {
        if (response.success) {
          const l = response.data;
          this.lot = {
            date_entree:         l.date_entree?.split('T')[0] || '',
            nombre_initial:      l.nombre_initial,
            race_id:             l.race_id,
            age_entree_semaines: l.age_entree_semaines,
            prix_achat_total:    l.prix_achat_total,
            sexe:                l.sexe             || 'mixte',
            pourcentage_sexe:    l.pourcentage_sexe || 100
          };
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Lot non trouvé';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Quand sexe change — ajuster pourcentage automatiquement
  onSexeChange(): void {
    if (this.lot.sexe === 'vavy' || this.lot.sexe === 'lahy') {
      this.lot.pourcentage_sexe = 100;
    }
  }

  enregistrer(): void {
    if (!this.lot.date_entree || !this.lot.nombre_initial || !this.lot.race_id) {
      this.erreur = 'Date, nombre et race sont obligatoires';
      this.cdr.detectChanges();
      return;
    }

    if (this.lot.pourcentage_sexe < 1 || this.lot.pourcentage_sexe > 100) {
      this.erreur = 'Pourcentage sexe doit être entre 1 et 100';
      this.cdr.detectChanges();
      return;
    }

    this.erreur = '';

    if (this.isEditing) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.lotService.updateLot(id, this.lot).subscribe({
        next: (response) => {
          if (response.success) {
            this.succes = 'Lot modifié avec succès !';
            setTimeout(() => this.router.navigate(['/lots']), 1500);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erreur = err.error?.message || 'Erreur modification';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.lotService.createLot(this.lot).subscribe({
        next: (response) => {
          if (response.success) {
            this.succes = 'Lot créé avec succès !';
            setTimeout(() => this.router.navigate(['/lots']), 1500);
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

  annuler(): void {
    this.router.navigate(['/lots']);
  }
}
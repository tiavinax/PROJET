import { Component, OnInit, LOCALE_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { RouterModule } from '@angular/router';
import { Lot } from '../../models/lot.model';
import { LotService } from '../../services/lot.service';

// Enregistrer le français une seule fois
registerLocaleData(localeFr);

@Component({
  selector: 'app-lot-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lot-list.html',
  styleUrls: ['./lot-list.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})

export class LotList implements OnInit {

  lots: Lot[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private lotService: LotService, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    console.log('LotList component créé, lotService:', this.lotService);
  }

  ngOnInit(): void {
    console.log('LotList.ngOnInit() appelé');
    this.chargerLots();
  }

  chargerLots(): void {
    console.log('LotList.chargerLots() appelé');
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Avant appel lotService.getLots()');
    this.lotService.getLots().subscribe({
      next: (response) => {
        console.log('✅ Réponse reçue:', response);
        console.log('response:', response);
        console.log('success:', response.success);
        console.log('data:', response.data);
        console.log('isLoading avant:', this.isLoading);

        if (response.success) {
          this.lots = response.data;
        }
        this.isLoading = false;

        console.log('lots après:', this.lots);
        console.log('isLoading après:', this.isLoading);

        // Forcer la détection de changement
        console.log('Appel de cdr.detectChanges()');
        this.cdr.detectChanges();
        console.log('Après cdr.detectChanges()');
      },
      error: (error) => {
        console.log('❌ Erreur HTTP:', error);
        console.error('Erreur détaillée:', error);
        this.errorMessage = 'Impossible de contacter le serveur. Vérifie que le backend est lancé sur http://localhost:3000';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
    console.log('Après appel lotService.getLots()');
  }

  supprimerLot(id: number | undefined): void {
    if (!id) return;

    if (confirm('Voulez-vous vraiment supprimer ce lot ?')) {
      this.lotService.deleteLot(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.chargerLots(); // Recharger la liste
          }
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }
}
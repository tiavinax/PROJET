import { Routes } from '@angular/router';

import { LotList } from './components/lot-list/lot-list';
import { Situation } from './components/situation/situation';
import { SuiviPoidsComponent } from './components/suivi-poids/suivi-poids';
import { LotForm } from './components/lot-form/lot-form';
import { RecensementOeufComponent } from './components/recensement-oeuf/recensement-oeuf';
import { TransformationOeufComponent } from './components/transformation-oeuf/transformation-oeuf';
import { MortaliteComponent } from './components/mortalite/mortalite';
import { PrixSakafoComponent } from './components/prix-sakafo/prix-sakafo';
import { RaceComponent } from './components/race/race';

export const routes: Routes = [
    { path: '', redirectTo: '/lots', pathMatch: 'full' },
    { path: 'lots', component: LotList },
    { path: 'lots/nouveau', component: LotForm },
    { path: 'lots/modifier/:id', component: LotForm },
    { path: 'situation', component: Situation },
    { path: 'suivi-poids', component: SuiviPoidsComponent },
    { path: 'recensement-oeuf', component: RecensementOeufComponent },
    { path: 'transformation-oeuf', component: TransformationOeufComponent },
    { path: 'mortalite', component: MortaliteComponent },
    { path: 'prix-sakafo', component: PrixSakafoComponent },
    { path: 'races', component: RaceComponent },
];


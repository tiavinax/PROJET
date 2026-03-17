export interface SituationLot {
    lot_id: number;
    race: string;
    nb_akoho: number;
    achat_akoho: number;
    sakafo_lany: number;
    nb_morts: number;
    poids_moyen: number;
    prix_vente: number;
    nb_atody: number;
    prix_atody: number;
    nb_atody_valides: number;    // ← nouveau
    prix_atody_valides: number;  // ← nouveau
    nb_lamokany: number;         // ← nouveau
    prix_lamokany: number;       // ← nouveau
    benefice: number;
}

export interface SituationGlobale {
    total_lots_actifs: number;
    total_akoho_vivants: number;
    total_morts: number;
    total_oeufs: number;
    chiffre_affaires: number;
    charges_totales: number;
    benefice_total: number;
    taux_mortalite: number;
    poids_moyen_global: number;
    total_lamokany: number;      // ← nouveau
    total_prix_lamokany: number; // ← nouveau
    total_sakafo: number; // vaovao
    total_achat: number; // vaovao]
    total_prix_atody: number;
}

export interface CapaciteRace {
    id: number;
    nom: string;
    capacite_initiale: number;
    pourcentage_vavy: number;
    pourcentage_lahy: number;
    duree_incubation: number;
    total_oeufs_collectes: number;
    total_vavy_ajoutees: number;
    nb_vavy_vivantes: number;          // ← nouveau
    capacite_max_globale: number;      // ← nouveau
    capacite_restante_globale: number; // ← nouveau
    capacite_restante: number;         // ← par poule
}

export interface CapaciteRaceGlobale {             
    race_id: number;
    race_nom: string;
    capacite_par_poule: number;
    nb_vavy_vivantes: number;
    capacite_max: number;
    total_oeufs_collectes: number;
    capacite_restante: number;
    pourcentage_utilise: number
}

export interface SituationResponse {
    success: boolean;
    date_filtre: string;
    data: SituationLot[];
    globale: SituationGlobale;
    capaciteRaces: CapaciteRace[]; // ← nouveau
    capaciteRacesGlobale: CapaciteRaceGlobale[];
}   
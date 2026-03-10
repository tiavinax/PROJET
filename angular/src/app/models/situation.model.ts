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
    taux_mortalite: number;  // en pourcentage
    poids_moyen_global: number;
}

export interface SituationResponse {
    success: boolean;
    date_filtre: string;
    data: SituationLot[];
    globale: SituationGlobale;  // ← nouveau
}
// export interface SituationLot {
//     lot_id: number;
//     race: string;
//     nb_akoho: number;
//     achat_akoho: number;
//     sakafo_lany: number;
//     nb_morts: number;
//     poids_moyen: number;
//     prix_vente: number;
//     nb_atody: number;
//     prix_atody: number;
//     benefice: number;
// }

// export interface SituationResponse {
//     success: boolean;
//     date_filtre: string;
//     data: SituationLot[];
// }
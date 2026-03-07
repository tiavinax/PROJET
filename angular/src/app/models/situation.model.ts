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

export interface SituationResponse {
    success: boolean;
    date_filtre: string;
    data: SituationLot[];
}
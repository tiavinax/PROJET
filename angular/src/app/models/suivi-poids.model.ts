export interface SuiviPoids {
    id: number;
    race_id: number;       // ← race_id au lieu de lot_id
    semaine: number;
    poids_recueilli_grammes: number;
    sakafo_consomme_grammes: number;
    race_nom: string;

}
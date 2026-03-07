export interface Lot {
    id: number;
    date_entree: string;
    nombre_initial: number;
    nombre_restant: number;
    age_entree_semaines: number;
    prix_achat_total: number;
    est_actif: boolean;
    race_id: number;       // ← ajouter
    race_nom: string;
}

export interface Race {
    id: number;
    nom: string;
    prix_vente_kg: number;
    prix_achat_unitaire: number;
}
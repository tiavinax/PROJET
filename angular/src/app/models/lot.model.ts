export interface Lot {
    id: number;
    date_entree: string;
    nombre_initial: number;
    nombre_restant: number;
    race_id: number;
    race_nom: string;
    age_entree_semaines: number;
    prix_achat_total: number;
    est_actif: number;
    sexe: 'vavy' | 'lahy' | 'mixte';
    pourcentage_sexe: number;
    nb_vavy_vivantes: number; // 
    nb_lahy_vivants: number;
}   

export interface Race {
    id: number;
    nom: string;
    prix_vente_kg: number;
    prix_achat_unitaire: number;
}
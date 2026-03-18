export interface Mortalite {
    id: number;
    lot_id: number;
    date_mortalite: string;
    nombre_morts: number;
    pourcentage_vavy: number;   // ← nouveau
    pourcentage_lahy: number;   // ← nouveau
    nb_vavy_morts: number;      // ← calculé par API
    nb_lahy_morts: number;      // ← calculé par API
    race_nom: string;           // ← depuis JOIN
}
// Convertir n'importe quelle date en "YYYY-MM-DD"
function toDateStr(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Calculer le nombre de jours entre deux dates "YYYY-MM-DD"
function diffJours(dateDebut, dateFin) {
    const d1 = new Date(dateDebut + 'T00:00:00');
    const d2 = new Date(dateFin + 'T00:00:00');
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Calcule le poids d'un poulet d'une race donnée entre deux dates
 * @param {Array} suiviPoids - Tableau de suivi des poids pour la race
 * @param {string} dateDebut - Date de début (généralement date d'entrée du lot)
 * @param {string} dateFin - Date de fin (généralement date filtre)
 * @returns {number} Poids calculé
 */
function getPoids(suiviPoids, dateDebut, dateFin) {
    const dateEntree = toDateStr(dateDebut);
    const dateFiltre = toDateStr(dateFin);
    let total = 0;

    for (const s of suiviPoids) {
        // IGNORER les semaines > 10 (version 2)
        if (s.semaine > 10) continue;

        // Date de cette semaine = dateEntree + semaine*7
        const dateSemaine = new Date(dateEntree + 'T00:00:00');
        dateSemaine.setDate(dateSemaine.getDate() + s.semaine * 7);
        const dateSemaineStr = toDateStr(dateSemaine);

        // S0 — poids initial complet si date_entree <= dateFiltre
        if (s.semaine === 0) {
            if (dateSemaineStr <= dateFiltre) {
                total += s.poids_recueilli_grammes;
            }
            continue;
        }

        // Bornes de la période
        const debutJour = (s.semaine - 1) * 7;
        const debut = new Date(dateEntree + 'T00:00:00');
        debut.setDate(debut.getDate() + debutJour);
        const debutStr = toDateStr(debut);

        const finJour = (s.semaine * 7) - 1;
        const fin = new Date(dateEntree + 'T00:00:00');
        fin.setDate(fin.getDate() + finJour);
        const finStr = toDateStr(fin);

        // Période future → 0
        if (debutStr > dateFiltre) continue;

        // Période complète
        if (finStr < dateFiltre) {
            total += s.poids_recueilli_grammes;
            continue;
        }

        // Période en cours — proportionnel
        const jours = diffJours(debutStr, dateFiltre) + 1;
        total += (s.poids_recueilli_grammes / 7) * jours;
    }

    return total;
}

module.exports = {
    getPoids,
    toDateStr,
    diffJours
};
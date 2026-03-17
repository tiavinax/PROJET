# GESTION DE FERME

> Projet : Système de gestion d’une ferme avicole
> Objectif : Suivi des lots, poids, sakafo, atody, mortalité et bénéfice

---

## 1. FONCTIONNALITÉS

***

### 1. Variation poids (donner)

**Structure :**

- Semaine
- Race
- Poids (g)
- Sakafo (g)

> Exemple :
>
> `S0 | Chaire | 150g | 0g`

---

### 2. Gestion sakafo (varie selon race)

- Poulet de chair → **150 Ar / g**

**Calcul attendu :**

`Sakafo_total = Quantité(g) × Prix_unitaire`

---

### 3. Recensement atody

> Ohatra :
>
> Nisy atody 45 tao amin’ny lot iray  
> Dia alaina ao amin’ilay lot ny isan’atody

- Enregistrer nombre atody
- Associer à un lot
- Historique par date

---

### 4. Mamadika atody ho lasa akoho

> Exemple :
>
> `45 atody → 40 foy (nouveau lot) + 5 lamokany`

**Traitement système :**

1. Déduire 45 atody du lot
2. Créer nouveau lot (40 foy)
3. Enregistrer perte (5)

~~Les œufs ne disparaissent pas sans traçabilité~~

---

### 5. Formulaire mampiditra lot

**Champs :**

- Date
- Nombre
- Race
- Age (semaine)

---

### 6. Déclaration akoho maty

> Rehefa misy akoho maty dia mihena automatique ny nombre

`Nouveau_total = Ancien_total - Nombre_maty`

---

## 2. OBJECTIF PRINCIPAL

***

### Situation du ferme à une date donnée

> Le système doit afficher la situation exacte selon filtre date

| Lot | Nombre_akoho | Race | Achat_akoho(Ar) | Sakafo_lany(Ar) | Akoho_maty | Poids_moyen(g/Kg) | PrixVente(Ar) | Nombre_Atody | PrixAtody(Ar) | Benefice(Ar) |
|-----|--------------|------|-------------|-------------|------------|-------------|------------|--------------|------------|----------|

---

### Bouton filtre

`Filtre(date) → Affichage situation correspondante`

---

## 3. CALCUL DU BENEFICE

***

**Formule générale :**
Benefice = (Prix_vente + Prix_atody) - (Achat_akoho + Sakafo_total)


---

## 4. TECHNOLOGIES

- **Front-end : Angular**
- **Back-end : Node.js**
- **Base de données : SQL Server**

---

## 5. INTERFACES (Structure Technique)

***

### Interface 1 : Gestion des lots

**Formulaire :**

- Date
- Race
- Nombre
- Age

Boutons :

- `Enregistrer`
- `Modifier`
- `Supprimer`

---

### Interface 2 : Gestion sakafo

> varie en fonction du race : Poulet de chair => 150ar/g

### Interface 3 : Variation poids

#### Interface 3.a : 

-----------------------------------------------------
| AJOUTER UNE VARIATION DE POIDS                     |
-----------------------------------------------------
| Lot: [L001 - Poulet de chair______]  Semaine: [S4]|
| Poids (g): [__________]  Nourriture (g): [______] |
|                                                     |
|                    [ANNULER]     [VALIDER]         |
-----------------------------------------------------

|Semain| |Race| |Poids(g)| |Sakafo(g)|

- Sélection lot
- Semaine
- Poids moyen
- Sakafo consommé

---


### Interface 4 : Recessement atody

> ohara nisy atody 45 tao ao @ lot iray de alaina ao @ le lot hoe

- Lot(semaine,nombre,race,age,nombre_atody);
- Date
- Nombre atody

Boutons :

- `Enregistrer`
- `Modifier`
- `Supprimer`

### Interface 6 : Mamadika atody ho lasa akoho

> ohatra : 45 atody => 40fohy(new lot) et 5 lamokany

---

### Interface 5 : Mortalité

- Lot
- Date
- Nombre maty

---

### Interface 7 : Dashboard

> Vue globale de la ferme

- Total lots
- Total akoho vivants
- Total atody
- Total mortalité
- Benefice estimé

---

## 6. NOTES IMPORTANTES

> Tous les calculs doivent être automatiques côté back-end

~~Ne jamais modifier directement les totaux sans logique métier~~

---

## 7. TÂCHES PROJET

- [x] Définition fonctionnalités
- [ ] Modélisation base de données
- [ ] API Node.js
- [ ] Interface Angular
- [ ] Calcul bénéfice
- [ ] Filtre par date

---

***
FIN DU DOCUMENT
***


# Proposition d'amélioration : 
## 1 : Dashboard avec graphiques : 
    Objectif : Visualiser l'évolution des lots dans le temps

Composants à ajouter :

typescript
// 1. Nouveau modèle
export interface GraphData {
    date: string;
    lots_actifs: number;
    poids_moyen_global: number;
    mortalite_cumulee: number;
    oeufs_pondus: number;
}

// 2. Nouvelle API endpoint
router.get('/dashboard/evolution', dashboardController.getEvolution);
Fonctionnalités :

Courbe d'évolution du poids moyen par race

Histogramme de mortalité par semaine

Cumul des œufs pondus

Sélecteur de période (7j, 30j, 90j)

# Proposition d'amélioration #2 : Alertes et notifications : 
Objectif : Prévenir l'utilisateur des situations anormales

// Dans situation.controller.js - à ajouter
const alertes = [];

// Alerte si mortalité > 5% sur une semaine
if ((morts_semaine / nb_initial) > 0.05) {
    alertes.push(`⚠️ Mortalité élevée dans le lot #${lot.id}`);
}

// Alerte si poids < 80% du poids attendu
if (poids_moyen < (poids_theorique * 0.8)) {
    alertes.push(`⚠️ Retard de croissance - lot #${lot.id}`);
}

// Alerte si stock œufs bas pour transformation 





SUITE DU PROJET : 

On va maitenant modifier un peut quelque fonctionnaliter et implementer d'autres

LE GRAND CHANGMENT : ON VA AUTOMATISER L'INCUBATION(TRANSFORMATION DES OEUFS EN LOT) ET CELA ENTRAINE => 
* on va ajouter des nouveau colonne dans RACE:

RACE :
-pourcentage(lahy(male),vavy(femelle)) et pourcentage peut etre un autre table pourcentage(libelle,valeur)
    ->pourquoi faire : dans le transformation des oeuf seule les vavy qui ponds des oeuf et les nouveau lot au transformation va avoir par exemle 60% vavy / 40% lahy
    ->duree_incubation(specifique par race , c'est pour ca qu'on le met dans la table race)
    ->capacite_pondation : int (pour indiquer qu'une poule peut pondre combien de fois durant toute ca vie par exemple : 40oeuf durant toute ca vie)

RECENSEMENT : 
    -> % lamokany(vue que le transformation est automatique on va fixer le pourcentage des atody lamokany au moment du collecte)
        impacte : ajout de champ % lamokany
    Et au moment du rencensement des oeuf on va transformer les atody car on sait a partir du duree_incubation quand les oeuf sera incuber par exemple race : 1 duree_incubation :30 jour date entrer lot1 : 01/01/26 date_transformation : 31/01/26

DEUXIEMEMENT : ON DOIT DONC MODIFIER UN PEUT L'AFFICHAGE DU SITUATION
AJOUT : % atody_lamokany | perte(si on vend les atody lamokany c'est combinen) 



    RACE apina : 
    -%LAHY/VAVY; 
    -duree_jour_fohy;
    -%lamokany(incubation);
    -CAPACITE DE PONDAISON = EX: in 40 manatody ihany ny akoho iray pendant son cycle de vie
    %atody lamokany(situation) : 

    FONCTIONNALITE : incubation automatique(pourcentage % lamokany fix par race )
    seule les vavy qui manatody











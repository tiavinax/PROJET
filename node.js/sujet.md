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
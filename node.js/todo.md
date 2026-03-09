                                            AKOHO

    # Creation des table necessaire

    LOT(ID,DATE_ENTRER,NB_AKOHO,ACHAT,NB_MATY,RACE,AGE,NB_ATODY);
    ATODY(ID,RACE,PU,ID_LOT);
    REGLE_SAKAFO(ID,RACE,PU);
    INVENTAIRE(ID,SEMAIN,LOT,SAKAFO,POIDS_RECUILLIE);
    RECENSEMENT(ID,DATE,LOT,NOMBRE);

    # Creation des entites necessaire

    lot(id:int,dateEntre:date,nb_akoho:int,nb_maty:int,race:string,age:int,nb_atody:int);
    atody(id:int,race:string,pu:double,idLot:int);
    inventaire(id:int,semaine:int,lot:lot,sakafo(g):int,poids_recuillie(g):int);
    recensement(id:int,date:date,lot:lot,nombre:int)



# Situation(lots:list<lot>,nb_akoho:int,race:string,Achat:double,Sakafo_consommer(g):int,nb_maty,poids_moyen,Prix_vente,nb_atody,prix_atody,Benefice_total);

    Fonctionnaliter prioriter (Situation du ferme en fonction d'une date donner)

        Class Situation : 
        - Methode :
            * CalculPrixVente(Lot) => (poids_moyen * PU) * nb_akoho;
            * 1.CalculerSakafoLany(DateFiltre,Lot)
                1.a CaclulerSakafoParSemaine(DateFiltre,Lot);
                1.b CalculSafoLanyFinal(Liste<SakafoLanySemaine>)
            * CalculerBenefice(LOT)

## ETAPE :

Les données qu'on doit calculer par lot
1. nb_akoho — Nombre de poulets vivants
nb_akoho = nombre_initial - total_morts (jusqu'à la date filtre)

2. Achat_akoho — Coût d'achat
Achat_akoho = prix_achat_total  (fixe, ne change pas)

3. Sakafo_lany — Nourriture consommée
// Seulement les semaines AVANT la date filtre
Sakafo_lany = SUM(sakafo_consomme_grammes) × prix_par_gramme 
                pour toutes les semaines où date_mesure <= date_filtre

4. poids_moyen — Poids actuel
// Le dernier suivi de poids AVANT la date filtre
poids_moyen = poids_moyen_grammes 
              de la ligne SUIVI_POIDS la plus récente <= date_filtre

5. Prix_vente — Ce qu'on gagnerait si on vendait aujourd'hui
Prix_vente = (poids_moyen / 1000) × prix_vente_kg × nb_akoho

6. nb_atody — Nombre d'œufs
nb_atody = SUM(nombre_oeufs) 
           de RECENSEMENT_OEUF où date_recensement <= date_filtre

7. prix_atody — Valeur des œufs
// On a besoin d'un prix unitaire par œuf — tu l'as dans ta BD ?
prix_atody = nb_atody × prix_unitaire_oeuf

8. Benefice
Benefice = (Prix_vente + prix_atody) - (Achat_akoho + Sakafo_lany)


CREATE TABLE PRIX_ATODY (
    id INT PRIMARY KEY AUTO_INCREMENT,
    race_id INT,
    prix_unitaire DECIMAL(10,2),  -- Prix par oeuf en Ariary
    date_debut DATE,              -- A partir de quelle date ce prix est valide
    FOREIGN KEY (race_id) REFERENCES RACE(id)
);
```

---

## 2. La logique du calcul Sakafo — le plus complexe

### Principe de base
```
date_entree lot : 01/01/2026
Semaine 1 : 01/01 → 07/01
Semaine 2 : 08/01 → 14/01
Semaine 3 : 15/01 → 21/01
```

### Calculer les bornes d'une semaine
```
debut_semaine = date_entree + (numero_semaine - 1) × 7 jours
fin_semaine   = date_entree + (numero_semaine × 7) - 1 jour
```

### Les 3 cas possibles selon date_filtre

**Cas 1 — Semaine complètement passée**
```
fin_semaine < date_filtre
→ sakafo_semaine = sakafo_consomme_grammes (100%)
```

**Cas 2 — Semaine en cours (date_filtre est DANS la semaine)**
```
debut_semaine <= date_filtre <= fin_semaine
→ jours_ecoules = date_filtre - debut_semaine + 1
→ sakafo_semaine = (sakafo_consomme_grammes / 7) × jours_ecoules
```

**Cas 3 — Semaine future**
```
debut_semaine > date_filtre
→ sakafo_semaine = 0  (pas encore consommé)
```

### Exemple concret
```
date_entree : 01/01/2026
date_filtre : 17/01/2026  (mercredi de la semaine 3)

Semaine 1 (01/01→07/01) : fin < filtre → 100% → 1000g
Semaine 2 (08/01→14/01) : fin < filtre → 100% → 2000g
Semaine 3 (15/01→21/01) : filtre DANS semaine
    → jours_ecoules = 17/01 - 15/01 + 1 = 3 jours
    → sakafo = (3000 / 7) × 3 = 1286g

Total grammes = 1000 + 2000 + 1286 = 4286g
Sakafo_lany(Ar) = 4286 × prix_par_gramme
```

---

## 3. Tous les calculs de la Situation
```
nb_akoho      = nombre_initial - SUM(morts jusqu'à date_filtre)

Achat_akoho   = prix_achat_total  (fixe)

Sakafo_lany   = SUM(sakafo_semaine_calculé) × prix_par_gramme

poids_moyen   = poids_moyen_grammes du dernier SUIVI_POIDS 
                où date_mesure <= date_filtre

Prix_vente    = (poids_moyen / 1000) × prix_vente_g(en va ajouter une colonne prix en gramme pour flexibliter et on va l'utiliser) × nb_akoho

nb_atody      = SUM(nombre_oeufs) où date <= date_filtre

Prix_atody    = nb_atody × prix_unitaire_oeuf (selon race)

Benefice      = (Prix_vente + Prix_atody) - (Achat_akoho + Sakafo_lany)
```

---

## 4. L'architecture du code
```
[Angular]
    → Sélecteur de date
    → Envoie GET /api/situation?date=2026-01-17
            ↓
[Node.js — SituationController]
    → Pour chaque lot actif :
        1. calculerNbAkoho(lot, date)
        2. calculerSakafoLany(lot, date)
            2a. calculerBornesSemaine(date_entree, num_semaine)
            2b. calculerSakafoSemaine(semaine, date_filtre, date_entree)
        3. calculerPoidsMoyen(lot, date)
        4. calculerPrixVente(lot, poids_moyen, nb_akoho)
        5. calculerNbAtody(lot, date)
        6. calculerPrixAtody(lot, nb_atody)
        7. calculerBenefice(...)
            ↓
[Angular]
    → Affiche le tableau Situation
```

---

## Une seule question avant de coder

Pour `prix_par_gramme` du sakafo — il est dans ta table `PRIX_SAKAFO` avec `date_debut` et `date_fin`. Est-ce que le prix **peut changer** au cours du temps pour le même lot ? 

Par exemple :
```
Semaine 1-3 : 150 Ar/g
Semaine 4+  : 180 Ar/g  (prix a augmenté)
```

Si oui, le calcul devient :
```
sakafo_lany = SUM(sakafo_semaine × prix_valide_cette_semaine)
```

Si non (prix fixe pour toute la durée), c'est plus simple :
```
sakafo_lany = total_grammes × prix_unique



    TODO : 
1. Modifier la BD (nouvelles colonnes/tables)
2. Node.js — model situation
3. Node.js — controller situation  
4. Node.js — route situation
5. Tester avec le navigateur
6. Angular ensuite







Sakafo_lany = SakafoLanySemaine(semaine, dateEntreeLot, dateFiltre) * prix_sakafo;

SakafoLanySemaine :

par example : date entrer du race_id = 1 (2026-03-07)

+----+---------+---------+-------------------------+-------------------------+
| id | race_id | semaine | poids_recueilli_grammes | sakafo_consomme_grammes |
+----+---------+---------+-------------------------+-------------------------+
|  1 |       1 |       0 |                     150 |                       0 |
|  2 |       1 |       1 |                     100 |                     150 |
|  3 |       1 |       2 |                     150 |                     200 |
|  4 |       1 |       3 |                     300 |                     500 |
|  5 |       1 |       4 |                     350 |                     500 |

date filtre : 2026-03-09

le calcul devrait etre commme suivant : puisque 9 est dans le semain 1

sakafo_semaine = 150(sakafo_consomme_grammes) / 7 * 3(car 07->09) = 64.2857 g
Sakafo_lany = sakafo_semaine * prix_sakafo = 64.2857g * 120Ar/g = 7714.285714Ar
et le calcul du poids moyen et le meme :

Poids_moyen = 150g(poids initial au semaine 0) + 100(poids_recueilli_grammes du semaine 1) / 7 * 3 = 192.857g





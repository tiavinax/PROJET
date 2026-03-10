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

Conception complète — Gestion Ferme Avicole

1. Architecture technique
Front-end  : Angular (standalone components, TypeScript)
Back-end   : Node.js / Express
Base de données : MariaDB / MySQL

2. Schéma de la base de données
RACE
  id, nom, prix_vente_kg, prix_achat_unitaire, prix_vente_gramme

LOT
  id, date_entree, nombre_initial, nombre_restant,
  race_id → RACE, age_entree_semaines,
  prix_achat_total, est_actif, nb_atody

SUIVI_POIDS
  id, race_id → RACE, semaine,
  poids_recueilli_grammes, sakafo_consomme_grammes
  UNIQUE (race_id, semaine)

MORTALITE
  id, lot_id → LOT, date_mortalite, nombre_morts

RECENSEMENT_OEUF
  id, lot_id → LOT, date_recensement, nombre_oeufs

TRANSFORMATION_OEUF
  id, lot_source_id → LOT,
  recensement_source_id → RECENSEMENT_OEUF,
  date_transformation, nombre_oeufs,
  nombre_poussins_obtenus, nombre_perte,
  lot_destination_id → LOT

PRIX_SAKAFO
  id, race_id → RACE (UNIQUE), prix_par_gramme

PRIX_ATODY
  id, race_id → RACE, prix_unitaire, date

3. Règles métier par entité
RACE

Une race définit le profil de croissance (suivi poids) commun à tous les lots de cette race
Une race a un prix de vente au gramme utilisé pour calculer le prix vente des lots
Une race a un prix sakafo (aliment) au gramme dans PRIX_SAKAFO
Une race a un prix atody (œuf) unitaire dans PRIX_ATODY


LOT

Un lot = un groupe d'animaux de même race entrés à la même date
nombre_restant = nombre_initial - total morts
est_actif = 1 tant que le lot est en vie
Un lot peut être créé manuellement ou issu d'une transformation (incubation d'œufs)
age_entree_semaines = âge des animaux à leur entrée dans le lot (0 pour des poussins)


SUIVI_POIDS

Lié à une RACE (pas un lot) — le tableau de croissance est identique pour tous les lots de même race
semaine 0 = poids initial à l'entrée (sakafo = 0)
semaine N = poids cumulé et sakafo consommé durant la période S(N-1) → S(N)
La date réelle de chaque semaine est calculée automatiquement :

date_semaine_N = date_entree_lot + N × 7 jours

MORTALITE

Enregistrement des morts par lot et par date
nombre_morts toujours positif
Réduit le nombre_restant du lot


RECENSEMENT_OEUF

Comptage des œufs pondus par lot à une date donnée
nombre_oeufs peut être négatif (déduction après transformation)
Le stock disponible d'un recensement =

nombre_oeufs - SUM(transformations liées à ce recensement)

TRANSFORMATION_OEUF

Transforme des œufs d'un recensement précis en poussins
Crée automatiquement un nouveau lot destination
Le nouveau lot hérite de la race du lot source
Enregistre la perte :

nombre_perte = nombre_oeufs - nombre_poussins_obtenus

La suppression d'une transformation supprime aussi le lot destination (rollback complet)


PRIX_SAKAFO

Un prix par race (UNIQUE)
Utilisé pour calculer le coût alimentaire dans la situation


PRIX_ATODY

Un prix par race
Utilisé pour calculer le revenu des œufs dans la situation


4. Calculs métier — Situation à une date filtre
Pour chaque lot actif à la date filtre :

nb_akoho
nb_akoho = nombre_initial - SUM(morts jusqu'à date_filtre)

Bornes temporelles d'une semaine
La semaine N couvre la période :
  debut = date_entree_lot + (N-1) × 7 jours
  fin   = date_entree_lot + (N  ) × 7 jours - 1

Exemple — lot entré le 07/03 :
  S1 : debut=07/03  fin=13/03
  S2 : debut=14/03  fin=20/03
  S3 : debut=21/03  fin=27/03

Contribution d'une semaine (sakafo ou poids)
Semaine 0 :
  poids  → valeur complète (poids initial)
  sakafo → 0 (pas d'alimentation le jour d'entrée)

Semaine N > 0 :
  Cas 1 — période future   (debut > date_filtre)
    → contribution = 0

  Cas 2 — période complète (fin < date_filtre)
    → contribution = valeur_semaine (100%)

  Cas 3 — période en cours (debut <= date_filtre <= fin)
    → jours_ecoules = date_filtre - debut + 1
    → contribution  = (valeur_semaine / 7) × jours_ecoules

sakafo_lany (coût alimentaire)
totalSakafoGrammes = SUM( contribution_sakafo(semaine N) )
sakafo_lany (Ar)   = totalSakafoGrammes × prix_par_gramme (PRIX_SAKAFO)

poids_moyen
poids_moyen (g) = SUM( contribution_poids(semaine N) )

Exemple — lot Gasy entré 07/03, filtre 09/03 :
  S0 : 150g (complet)
  S1 : 100g / 7 × 3 jours = 42.857g
  S2, S3, S4 → 0 (futurs)

  poids_moyen = 150 + 42.857 = 192.857g

prix_vente
prix_vente (Ar) = poids_moyen × prix_vente_gramme × nb_akoho

nb_atody et prix_atody
nb_atody   = SUM(nombre_oeufs dans RECENSEMENT_OEUF jusqu'à date_filtre)
             (inclut les valeurs négatives des transformations)

prix_atody = nb_atody × prix_unitaire (PRIX_ATODY de la race)

benefice
revenus  = prix_vente + prix_atody
charges  = prix_achat_total + sakafo_lany

benefice = revenus - charges

5. Flux de transformation œufs → poussins
Étape 1 — Choisir le lot source (pondeuses)

Étape 2 — Choisir le recensement précis
  → Chaque recensement = une ponte à une date précise
  → Stock restant = nombre_oeufs - déjà transformés
  → Les œufs du 07/03 et du 20/03 ont des temps
    d'incubation différents → on distingue chaque ponte

Étape 3 — Saisir nombre_oeufs_utilisés
  → Limité au stock restant du recensement choisi

Étape 4 — Saisir nombre_poussins_obtenus
  → perte = nombre_oeufs - nombre_poussins_obtenus

Résultat :
  → Nouveau LOT créé automatiquement (poussins)
  → Race héritée du lot source
  → Suppression = rollback complet (lot destination supprimé)

6. Routes API
GET/POST/PUT/DELETE  /api/races
GET/POST/PUT/DELETE  /api/lots
GET/POST/PUT/DELETE  /api/suivi-poids
GET/POST/PUT/DELETE  /api/mortalite
GET/POST/PUT/DELETE  /api/recensement-oeuf
GET/POST/PUT/DELETE  /api/prix-sakafo
GET/POST/PUT/DELETE  /api/prix-atody
GET/POST/DELETE      /api/transformation-oeuf
GET                  /api/transformation-oeuf/recensements-disponibles/:lotId
GET                  /api/situation?date=YYYY-MM-DD
POST                 /api/reinitialiser

7. Pages Angular
/situation          → Tableau de bord — calculs à une date
/lots               → Liste et gestion des lots
/races              → Liste et gestion des races
/suivi-poids        → Tableau de croissance par race
/mortalite          → Enregistrement des morts
/prix-sakafo        → Prix aliment par race
/prix-atody         → Prix œuf par race
/recensement-oeuf   → Comptage des œufs par lot
/transformation-oeuf→ Incubation œufs → poussins

8. Points importants à retenir
1. SUIVI_POIDS lié à RACE (pas LOT)
   → même tableau de croissance pour tous les lots de même race

2. date_entree du LOT est la référence temporelle
   → toutes les semaines sont calculées depuis cette date

3. Semaine 0 = jour d'entrée
   → poids initial enregistré, sakafo = 0

4. RECENSEMENT_OEUF accepte les négatifs
   → les transformations déduisent via une ligne négative

5. Timezone MySQL → toujours nettoyer avec split('T')[0]
   avant tout calcul de date en JavaScript

6. Validation semaine 0 → utiliser === null/undefined/''
   et jamais !semaine (car !0 = true en JavaScript)
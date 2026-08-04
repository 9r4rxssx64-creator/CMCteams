# ☁️ Audit RÉEL du cloud familial (ce que voient les téléphones)

_Généré automatiquement le 2026-08-04 00:02 UTC par `tools/arbre/cloud-audit.mjs` (CI, réseau ouvert)._
_Base : `<FB>/arbre/a43c9ae454dfed007839c2e26b7b5358b7bc4087ecd74094d2dd43cc4b624aa7` — auth anonyme identique à l'app._

## Vue d'ensemble

| Quoi | Valeur |
|---|---|
| Personnes dans le cloud | **62** |
| Fiches officielles (seed) | 62 / 62 attendues |
| Fiches hors-seed (ajouts / anciennes copies) | 0 |
| seedVersion cloud | 17 (app attend 17) |

## 1) Fiches officielles : chaque lien vérifié contre le document familial

- ✅ **62** fiches seed avec père/mère/conjoints EXACTEMENT conformes au document.
- 🎉 Aucune contradiction sur les fiches officielles.

## 2) Fiches hors-seed : anciennes copies-fantômes vs vrais ajouts de la famille

✅ Aucune fiche-fantôme.

## 3) Vérification ciblée du signalement (« Yann et Loïc ↔ Christian et Marie-Brigitte »)

- **Loïc DESARZENS** (`seed_loic`) : père=Émile DESARZENS · mère=∅ _(fiche officielle — doc : fils d'Émile DESARZENS)_
- **Yann DESARZENS** (`seed_yann`) : père=Émile DESARZENS · mère=∅ _(fiche officielle — doc : fils d'Émile DESARZENS)_
- **Christian** (`seed_christian`) : conjoints=[Marie-Brigitte SAUVAIGO] · enfants pointant vers lui : Cécile

## 4) Correction automatique

✅ Rien à corriger — le cloud est déjà propre, aucune écriture faite.

---
_Les fiches avec photos ou commentaires ne sont JAMAIS supprimées. L'app v2.29 fait le même nettoyage en local à chaque ouverture (`purgeSeedShadows`), donc même un vieux téléphone qui repousserait un fantôme sera re-nettoyé._

---
name: cadrer-une-modification
description: Cadrer une évolution d’une appli existante avant de la réaliser. Demande ce que la personne veut pouvoir faire et ce qui doit se passer si ça coince, regarde l’existant, puis résume ce que les gens verront et ce qui changera dans l’appli. À utiliser pour chaque ajout, correction ou changement de fonctionnalité.
---

## Demander d’abord

1. **Ce que la personne veut pouvoir faire** · l’action, qui la fait et le résultat visible qui prouve que ça a marché.
2. **Ce qui doit se passer si ça coince** · ce que l’écran affiche, ce qui est enregistré ou non, et comment on continue.

Si la demande répond déjà à l’une de ces questions, reformule la réponse au lieu de la reposer. Pose une question à la fois et seulement si la réponse change ce qu’il faut construire. N’ajoute pas de cas secondaires que la personne n’a pas évoqués.

## Regarder ce qui existe

- Lis `AGENTS.md`, la page concernée dans `src/app`, ses actions serveur, les règles dans `src/lib`, le schéma `src/db/schema.ts` et les migrations de `drizzle/`.
- Repère ce qui peut être réutilisé (composants, calculs, validation) et ce que la modification peut casser : un écran, une règle existante, des données déjà enregistrées.
- Si la forme des données change, regarde avec le MCP Neon, en lecture seule, ce que contient déjà la branche de développement.
- Si une inconnue technique conditionne tout le reste, signale-la et propose une vérification ciblée avant le résumé.

## Résumer en deux parties

**Ce que les gens verront** · en mots simples, sans jargon : où apparaît la nouveauté, l’action, le résultat affiché, un exemple chiffré que la personne peut vérifier, et ce qui se passe quand ça coince.

**Ce que je devrai changer dans l’appli** · les fichiers ou modules touchés, les données (nouvelle table ou colonne, migration sur la branche de développement, sort des données existantes), la règle que le serveur fera respecter et la façon dont je vérifierai le parcours.

Termine par ce qui attendra, si tu as écarté quelque chose.

## Attendre l’accord

- Ne modifie aucun fichier, n’écris rien dans la base et n’applique aucune migration avant un accord explicite.
- Si la personne corrige le résumé, mets-le à jour et redemande son accord.
- Après l’accord, réalise la modification avec [adapter-starter](../adapter-starter/SKILL.md) et `AGENTS.md`. Rends le parcours testé, la règle vérifiée et l’environnement qui a reçu une éventuelle migration.

## Exemple

« Je veux pouvoir corriger le prix d’une dépense. » Questions : qui peut corriger, et que se passe-t-il si le nouveau prix est invalide ? Existant : la liste des dépenses, la validation du prix et le calcul des soldes. **Ce que les gens verront** : un bouton « Corriger » sur chaque dépense ; Lina passe ses courses de 30 € à 36 € et récupère alors 24 € au lieu de 20 €. Un prix invalide affiche quoi corriger et garde l’ancien montant. **Ce que je devrai changer** : une action serveur de mise à jour qui réutilise la validation, un champ d’édition dans la liste, aucune migration. Ce qui attendra : l’historique des corrections.

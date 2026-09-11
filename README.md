# Ratoncito — dossier clinique vétérinaire

Dossier de consultation NAC structuré pour une lecture mobile et une consultation
complète sur ordinateur ou tablette.

## Parcours clinique

Le dossier suit l’ordre d’examen suivant :

1. identification et vue d’ensemble du patient ;
2. anamnèse ;
3. examen clinique ;
4. examens complémentaires ;
5. classification des hypothèses diagnostiques ;
6. synthèse clinique et conduite à tenir ;
7. annexe de suivi en cas d’adoption.

Les faits observés, leur interprétation et la conclusion sont présentés séparément.
Les données affichées dans les tableaux et les textes cliniques sont regroupées
dans `src/data.ts`, indépendamment de la logique d’interface.

## Démarrage local

Prérequis : Node.js 20.19 ou 22.12 et plus récent.

    npm install
    npm run dev

Commandes de contrôle :

    npm run typecheck
    npm run test
    npm run build
    npm run preview

## Configuration du dossier

Les informations structurelles sont regroupées dans `src/config.ts`.
Le nom de la destinataire peut être fourni avec `VITE_RECIPIENT_NAME` en local
ou avec le secret GitHub Actions `RATONCITO_RECIPIENT_NAME` pour Pages. Il ne
doit pas être inscrit directement dans le dépôt public.

## Structure

    src/
      App.tsx                 interface et parcours clinique
      config.ts              configuration centrale
      data.ts                observations et résultats
      domain.ts              progression et classification
      main.tsx               point d’entrée
      styles.css             mise en page du dossier
      closure-refused.css    compte rendu d’incident
    docs/
      clinical-sources.md
      deployment.md
      email-copy.md
      image-prompts.md

## Références cliniques

Les sources, les limites d’extrapolation et les choix de présentation sont
documentés dans `docs/clinical-sources.md`.

Le patient est identifié comme *Rattus rattus*. Lorsqu’un intervalle chiffré est
affiché, il est présenté comme une comparaison prudente avec des intervalles
publiés chez le rat de compagnie *Rattus norvegicus*. Aucune valeur canine ou
féline n’est utilisée.

## Déploiement

Voir `docs/deployment.md` pour le build statique et les options d’hébergement.

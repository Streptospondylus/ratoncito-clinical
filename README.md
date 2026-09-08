# Ratoncito — dossier clinique interactif

Micro-expérience web autonome présentant un cas NAC fictif dans une interface de
référé vétérinaire. Le parcours est mobile-first, mais dispose d’une mise en page
complète pour ordinateur et tablette.

## Intention

La personne qui reçoit le lien explore un véritable dossier de consultation :

1. vue d’ensemble du patient ;
2. anamnèse ;
3. examen clinique ;
4. examens complémentaires ;
5. classification des hypothèses ;
6. génération d’une synthèse clinique à révélation progressive.

Le ton reste clinique et retenu. Les données de comportement sont des mesures de
simulation narrative ; elles ne constituent pas un protocole diagnostique validé.

## Démarrage local

Prérequis : Node.js 20.19 ou 22.12 et plus récent.

    npm install
    npm run dev

Les commandes utiles sont :

    npm run typecheck
    npm run test
    npm run build
    npm run preview

## Personnalisation

Les informations modifiables sont regroupées dans src/config.ts. Avant un envoi,
renseigner notamment :

- recipient.displayName ;
- patient.age ;
- patient.weight ;
- les noms de cliniciens si nécessaire ;
- les formulations de la conclusion ;
- le texte du mail.

Les données affichées dans les tableaux et les textes cliniques sont séparées de la
logique d’interface dans src/data.ts.

## Structure

    src/
      App.tsx       interface et parcours interactif
      config.ts     personnalisation centrale
      data.ts       contenu clinique de simulation
      domain.ts     règles de progression et de classification
      main.tsx      point d’entrée
      styles.css    direction visuelle et responsive
    docs/
      clinical-sources.md
      deployment.md
      email-copy.md

## Qualité clinique

La documentation des sources, des limites d’extrapolation et des choix de contenu
est disponible dans docs/clinical-sources.md.

Le cas emploie Rattus rattus comme espèce narrative. Lorsqu’un intervalle chiffré
est affiché, il est explicitement présenté comme une comparaison prudente avec des
intervalles publiés chez le rat de compagnie Rattus norvegicus. Aucune valeur
canine ou féline n’est utilisée.

## Déploiement

Voir docs/deployment.md pour le build statique et les options d’hébergement.

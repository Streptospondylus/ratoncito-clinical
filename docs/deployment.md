# Déploiement

## Build statique

Installer les dépendances puis produire le dossier de production :

    npm install
    npm run typecheck
    npm run test
    npm run build

Le résultat déployable se trouve dans dist/.

## Hébergement

L’application ne nécessite ni serveur applicatif ni base de données. Elle peut être
servie par un hébergeur statique compatible avec Vite, par exemple :

- GitHub Pages avec une action de build ;
- Cloudflare Pages ;
- Netlify ;
- un serveur web classique qui sert dist/.

Conserver une URL neutre, sans information personnelle dans le nom de domaine ou
le chemin public. Aucun achat de domaine ou service payant n’est requis par le
projet.

## Vérifications avant partage

1. Dans GitHub, créer le secret Actions `RATONCITO_RECIPIENT_NAME` avec le prénom
   ou surnom à révéler. Ne pas l’écrire dans un fichier du dépôt public.
2. Tester l’ouverture depuis un téléphone réel.
3. Ouvrir chaque module d’examens.
4. Classer les sept hypothèses.
5. Attendre la révélation puis fermer le dossier.
6. Vérifier que le titre, la favicon, les métadonnées et l’URL ne contiennent
   aucune donnée personnelle.
7. Vérifier le parcours avec le mode de mouvement réduit du système.

## En-têtes conseillés

Pour un hébergement final, activer au minimum :

- HTTPS ;
- Content-Security-Policy adaptée aux assets de l’application ;
- X-Content-Type-Options: nosniff ;
- Referrer-Policy: no-referrer ;
- mise en cache longue pour les assets versionnés.

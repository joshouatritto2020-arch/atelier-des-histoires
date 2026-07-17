# Atelier des Histoires

Application web installable (PWA) pour écrire, organiser, publier et lire des histoires.

## Fonctionnalités déjà incluses

- Compte obligatoire par e-mail pour les lecteurs.
- Compte administrateur/auteur réservé à `joshouatritto2020@gmail.com`.
- Création d’histoires et de chapitres, statut brouillon/publié.
- Sauvegarde cloud liée au compte e-mail.
- Fiches de personnages de tout type.
- Correcteur natif du navigateur + assistant local : répétitions, phrases longues, paragraphes denses, tournures fréquentes, statistiques de texte.
- Suggestions facultatives pour faire avancer l’histoire selon le genre.
- Mode lecture avec sommaire et navigation par chapitre.
- Genres, couverture, résumé, partage, likes et commentaires.
- Statistiques : vues, utilisateurs uniques, temps de lecture, likes, commentaires, partages et clics.
- Personnalisation des couleurs, formes, arrondis et style de police.
- Installation sur ordinateur et mobile grâce au mode PWA.

## 1. Installer le projet

```bash
npm install
cp .env.example .env.local
```

## 2. Créer le projet Supabase

1. Crée un projet Supabase.
2. Ouvre **SQL Editor**.
3. Copie-colle le contenu de `supabase/schema.sql`, puis exécute-le.
4. Dans **Authentication > URL Configuration**, ajoute :
   - URL locale : `http://localhost:3000`
   - URL de production : ton futur domaine Vercel
5. Dans **Authentication > Providers > Email**, active la connexion par e-mail.
6. Récupère l’URL du projet et la clé publique dans **Project Settings > API Keys**.

## 3. Configurer `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://TON-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TA_CLE_PUBLIQUE
NEXT_PUBLIC_ADMIN_EMAIL=joshouatritto2020@gmail.com
```

La clé publique Supabase peut être utilisée dans le navigateur uniquement parce que les règles RLS du fichier SQL protègent chaque table. Ne mets jamais une clé `service_role` dans ce fichier.

## 4. Lancer en local

```bash
npm run dev
```

Puis ouvre `http://localhost:3000`.

## 5. Créer le compte auteur

Inscris-toi avec `joshouatritto2020@gmail.com`. Ce compte verra automatiquement les onglets **Studio**, **Audience** et **Design**. Les autres comptes seront des lecteurs.

## 6. Mettre en ligne sur Vercel

1. Dépose ce dossier sur GitHub ou importe-le directement dans Vercel.
2. Ajoute les trois variables d’environnement dans **Vercel > Settings > Environment Variables**.
3. Lance le déploiement.
4. Ajoute ensuite le domaine Vercel dans les URL autorisées de Supabase Auth.

## Limites du MVP et améliorations futures

Le correcteur intégré est volontairement local et privé. Il détecte déjà plusieurs problèmes de style et s’appuie aussi sur le correcteur orthographique du navigateur, mais il ne remplace pas encore un moteur linguistique avancé. Une future version peut ajouter :

- correction grammaticale et réécriture par IA avec validation avant remplacement ;
- export EPUB/PDF ;
- images de personnages et couvertures stockées dans Supabase Storage ;
- notifications, abonnements à un auteur et favoris ;
- modération anti-spam et signalement ;
- tableaux de bord graphiques et filtres par période ;
- nom de domaine personnalisé et e-mails de marque.

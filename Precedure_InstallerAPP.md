# Comment installer BoLac (appli native Android) sur ton téléphone

Ce fichier explique comment installer — ou mettre à jour — la version native
de BoLac sur ton téléphone Android, sans câble USB et sans aide.

## Où trouver le fichier à installer

Le fichier s'appelle **`BoLac.apk`**, il se trouve dans le dossier :

```
D:\OneDrive\Documents\Application web\BoLac\BoLac-app\BoLac.apk
```

Ce dossier est synchronisé automatiquement par OneDrive — le fichier
apparaît donc aussi sur ton téléphone via l'appli OneDrive, sans rien faire
de plus. Chaque fois que Claude met à jour l'appli native, ce même fichier
est remplacé par la nouvelle version.

## Étapes d'installation (ou de mise à jour)

1. Sur ton téléphone, ouvre l'appli **OneDrive**.
2. Navigue vers **Documents → Application web → BoLac → BoLac-app**.
3. Touche **BoLac.apk** (télécharge-le si OneDrive te le demande), puis
   touche **Ouvrir**.
4. **La toute première fois seulement**, Android va probablement bloquer
   l'installation avec un message du genre *« Pour votre sécurité, votre
   téléphone n'est pas autorisé à installer des applications inconnues
   depuis cette source »*.
   - Touche **Paramètres** dans ce message.
   - Active **« Autoriser depuis cette source »** pour l'appli OneDrive.
   - Reviens en arrière et touche de nouveau le fichier `BoLac.apk`.
5. Touche **Installer**.

C'est tout ! Les fois suivantes (mises à jour), Android reconnaît que
c'est toujours BoLac et remplace simplement l'ancienne version — **tes
trajets, waypoints et photos déjà enregistrés dans l'appli native restent
intacts**, pas besoin de désinstaller entre deux versions.

## Petit rappel : PWA vs appli native

Il y a deux façons d'avoir BoLac sur ton téléphone, et elles ne partagent
**pas** leurs données entre elles :

- **La PWA** (celle installée depuis le navigateur / bo-lac-lac.vercel.app)
  — se met à jour toute seule, mais le suivi GPS peut s'interrompre si
  l'écran se verrouille pendant un enregistrement.
- **L'appli native** (celle de ce fichier `BoLac.apk`) — c'est celle à
  utiliser pour enregistrer de vraies sorties, le suivi GPS continue même
  écran verrouillé. Se met à jour seulement quand tu réinstalles le
  fichier `BoLac.apk` (voir ci-dessus).

Si un jour tu as des trajets dans l'une et pas dans l'autre : dans
l'appli d'où viennent les trajets, va dans **Sauvegarde → Télécharger la
sauvegarde (.zip)**, puis dans l'autre appli, **Sauvegarde → Importer**
ce fichier .zip.

# mccate.com: bewerkscherm instellen (eenmalig, ca. 15 minuten)

Na deze stappen bewerk je de site op https://www.mccate.com/admin (of tijdelijk op https://mccate-company.netlify.app/admin).

## 1. GitHub
1. Maak een gratis account op github.com.
2. Maak een nieuwe, lege repository, bijvoorbeeld `mccate-website` (privé mag).
3. Zet de inhoud van deze map in die repository (zonder de map `dist`, die staat al in .gitignore).

## 2. Netlify koppelen aan GitHub
1. Netlify, project *mccate-company*, Project configuration, Build & deploy, Continuous deployment, Link repository. Kies de repository.
2. De instellingen (`node build.js`, publish `dist`) staan al in `netlify.toml`.

## 3. Inloggen op het bewerkscherm toestaan
1. GitHub, Settings, Developer settings, OAuth Apps, New OAuth App.
   - Homepage URL: je siteadres
   - Callback URL: `https://api.netlify.com/auth/done`
2. Kopieer de Client ID en maak een Client Secret.
3. Netlify, Project configuration, Access & security, OAuth, Install provider: kies GitHub en plak daar Client ID en Secret.

## 4. Gebruiken
Ga naar `/admin`, log in met GitHub, pas teksten of foto's aan en klik op *Publish*.
Na ongeveer een minuut staat de wijziging live.

## Nieuwe taal toevoegen (NL, SV)
Kopieer `content/en` naar `content/nl` en vertaal de teksten. De site maakt dan zelf `/nl/`-pagina's met taalknop en hreflang.

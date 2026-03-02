# Menu interactif — The Roost Coffee

Menu digital avec recherche, filtres par catégorie (café, thé, pâtisserie) et par régime (végane, sans gluten), et bascule thème clair/sombre.

## Démarrage

Ouvrir `index.html` dans un navigateur (double-clic ou via un serveur local).

Pour éviter les restrictions CORS sur le chargement de `menu-data.json`, lancer un serveur local :

```bash
# Python 3
python3 -m http.server 8000

# ou avec npx (Node.js)
npx serve .
```

Puis aller sur `http://localhost:8000`.

## Structure du projet

```
menuInteractif/
├── index.html      # Page du menu
├── styles.css      # Styles (thème clair/sombre, cartes, filtres)
├── app.js          # Logique : chargement JSON, recherche, filtres, rendu
├── menu-data.json  # Données du menu (items, prix, tags)
├── images/         # Logos et illustrations des produits
└── README.md
```

## Technologies

- HTML, CSS, JavaScript vanilla
- Données en JSON chargées via `fetch`
- Polices : Libre Baskerville, DM Sans (Google Fonts)

## Licence

Projet personnel / démo.

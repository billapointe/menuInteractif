// /// script
// requires-python = ">=3.12"
// dependencies = []
// ///

// ===============================
// MENU DIGITAL — LOGIQUE FRONT
// ===============================

// État global simple pour stocker les données du menu et les filtres courants
const state = {
  items: [],
  // Catégorie active (café, thé, pâtisserie, etc.)
  categorieActive: "all",
  // Terme saisi dans la barre de recherche
  termeRecherche: "",
  // Filtre de régime alimentaire : "all" | "vegan" | "sans_gluten"
  filtreRegime: "all",
};

/**
 * Récupère l'élément racine <html> du document.
 * Utilisé pour lire et modifier l'attribut de thème (data-theme).
 */
function getHtmlRootElement() {
  return document.documentElement;
}

/**
 * Charge les données du menu depuis le fichier JSON.
 * Retourne une promesse qui résout avec un tableau d'items.
 */
function chargerDonneesMenu() {
  return fetch("menu-data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Impossible de charger le menu (" + response.status + ")");
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !Array.isArray(data.menu)) {
        throw new Error("Format de données inattendu pour le menu.");
      }
      return data.menu;
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
}

/**
 * Crée un élément <li> pour un tag (vegan, sans gluten, allergènes, etc.).
 * Retourne l'élément DOM prêt à être inséré.
 */
function creerTagElement(classeSupplementaire, texte, titreOptionnel) {
  const tag = document.createElement("li");
  tag.className = "menu-card-tag " + classeSupplementaire;
  tag.textContent = texte;
  // On ajoute un titre au survol pour préciser la signification du tag
  if (titreOptionnel) {
    tag.title = titreOptionnel;
  }
  return tag;
}

/**
 * Crée la liste des tags (vegan, sans gluten, allergènes) pour une carte.
 * Retourne un élément <ul>.
 */
function creerListeTags(item) {
  const ul = document.createElement("ul");
  ul.className = "menu-card-tags js-card-tags";
  ul.setAttribute("aria-label", "Allergènes et régimes");

  const tags = item.tags || {};

  if (tags.vegan) {
    ul.appendChild(
      creerTagElement(
        "menu-card-tag--vegan",
        "Végane",
        "Option adaptée à une alimentation végane"
      )
    );
  }

  if (tags.sans_gluten) {
    ul.appendChild(
      creerTagElement(
        "menu-card-tag--sans-gluten",
        "Sans gluten",
        "Préparation sans gluten"
      )
    );
  }

  if (Array.isArray(tags.allergenes)) {
    tags.allergenes.forEach((allergene) => {
      ul.appendChild(
        creerTagElement(
          "menu-card-tag--allergene",
          capitaliserPremierCaractere(allergene),
          "Allergène : " + capitaliserPremierCaractere(allergene)
        )
      );
    });
  }

  return ul;
}

/**
 * Formate un prix numérique au format monétaire avec symbole du dollar.
 * Retourne une chaîne prête à afficher (ex: "4,50 $").
 */
function formaterPrix(prix) {
  if (typeof prix !== "number") {
    return "";
  }
  return prix.toLocaleString("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });
}

/**
 * Met une majuscule sur la première lettre d'une chaîne.
 * Retourne la chaîne transformée ou la valeur d'origine si non valide.
 */
function capitaliserPremierCaractere(texte) {
  if (typeof texte !== "string" || texte.length === 0) {
    return texte;
  }
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * Crée un élément <article> représentant une carte produit à partir des données JSON.
 * Retourne l'élément DOM complet (carte du menu).
 */
function creerCarteMenu(item) {
  const article = document.createElement("article");
  article.className = "menu-card js-menu-card";
  article.dataset.category = item.categorie;
  article.dataset.id = item.id;

  const imageWrap = document.createElement("div");
  imageWrap.className = "menu-card-image";

  const img = document.createElement("img");
  img.src = item.image;
  img.alt = "";
  img.loading = "lazy";
  imageWrap.appendChild(img);

  const body = document.createElement("div");
  body.className = "menu-card-body";

  const titre = document.createElement("h3");
  titre.className = "menu-card-name";
  titre.textContent = item.nom;

  const prix = document.createElement("p");
  prix.className = "menu-card-price";
  prix.innerHTML = formaterPrix(item.prix).replace("CA$", "$");

  const description = document.createElement("p");
  description.className = "menu-card-description";
  description.textContent = item.description;

  const tags = creerListeTags(item);

  body.appendChild(titre);
  body.appendChild(prix);
  body.appendChild(description);
  body.appendChild(tags);

  article.appendChild(imageWrap);
  article.appendChild(body);

  return article;
}

/**
 * Efface toutes les cartes actuellement présentes dans la grille.
 * Utilisé avant de réinsérer les cartes filtrées / recherchées.
 */
function viderGrilleMenu(grilleElement) {
  grilleElement.innerHTML = "";
}

/**
 * Insère dans la grille les items passés en paramètre.
 * Crée une carte pour chaque entrée de données.
 * Si aucun item ne correspond (ex. recherche "Pizza"), affiche "Aucun résultat".
 */
function rendreCartesDansGrille(grilleElement, items) {
  viderGrilleMenu(grilleElement);

  if (items.length === 0) {
    const messageVide = document.createElement("p");
    messageVide.className = "menu-grid-empty js-menu-grid-empty";
    messageVide.textContent = "Aucun résultat";
    grilleElement.appendChild(messageVide);
    return;
  }

  items.forEach((item) => {
    const carte = creerCarteMenu(item);
    grilleElement.appendChild(carte);
  });
}

/**
 * Applique les filtres de catégorie et de recherche sur la liste complète.
 * Retourne un nouveau tableau filtré à partir de l'état global.
 */
function obtenirItemsFiltres() {
  const categorie = state.categorieActive;
  const terme = state.termeRecherche.trim().toLowerCase();
  const filtreRegime = state.filtreRegime;

  return state.items.filter((item) => {
    const tags = item.tags || {};

    const correspondCategorie =
      categorie === "all" ? true : item.categorie === categorie;

    if (!correspondCategorie) {
      return false;
    }

    // Filtre sur le régime alimentaire (vegan / sans gluten)
    const correspondRegime =
      filtreRegime === "all"
        ? true
        : filtreRegime === "vegan"
        ? !!tags.vegan
        : filtreRegime === "sans_gluten"
        ? !!tags.sans_gluten
        : true;

    if (!correspondRegime) {
      return false;
    }

    if (!terme) {
      return true;
    }

    const texteRecherche = [
      item.nom,
      item.description,
      item.categorie,
      (item.tags && item.tags.allergenes && item.tags.allergenes.join(" ")) || "",
    ]
      .join(" ")
      .toLowerCase();

    return texteRecherche.includes(terme);
  });
}

/**
 * Met à jour l'état de la catégorie active et déclenche un re-rendu des cartes.
 */
function mettreAJourCategorieActive(nouvelleCategorie, grilleElement) {
  state.categorieActive = nouvelleCategorie;
  const itemsFiltres = obtenirItemsFiltres();
  rendreCartesDansGrille(grilleElement, itemsFiltres);
}

/**
 * Met à jour l'état du filtre de régime (vegan / sans gluten) et réaffiche les cartes.
 */
function mettreAJourFiltreRegime(nouveauFiltre, grilleElement) {
  state.filtreRegime = nouveauFiltre;
  const itemsFiltres = obtenirItemsFiltres();
  rendreCartesDansGrille(grilleElement, itemsFiltres);
}

/**
 * Met à jour l'état du terme de recherche et déclenche un re-rendu des cartes.
 */
function mettreAJourTermeRecherche(nouveauTerme, grilleElement) {
  state.termeRecherche = nouveauTerme;
  const itemsFiltres = obtenirItemsFiltres();
  rendreCartesDansGrille(grilleElement, itemsFiltres);
}

/**
 * Gère l'état visuel des boutons de filtre (classe is-active).
 * Active uniquement le bouton correspondant à la catégorie choisie.
 */
function mettreAJourEtatBoutonsFiltre(boutonsFiltre, categorieActive) {
  boutonsFiltre.forEach((btn) => {
    const categorieBouton = btn.dataset.category;
    if (categorieBouton === categorieActive) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
  });
}

/**
 * Gère l'état visuel des boutons du filtre de régime (classe is-active).
 * Active uniquement le bouton correspondant au filtre choisi.
 */
function mettreAJourEtatBoutonsFiltreRegime(boutonsRegime, filtreActif) {
  boutonsRegime.forEach((btn) => {
    const filtreBouton = btn.dataset.diet || "all";
    if (filtreBouton === filtreActif) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
  });
}

/**
 * Récupère la préférence de thème de l'utilisateur dans le localStorage.
 * Retourne "light", "dark" ou null si rien n'est enregistré.
 */
function lireThemeDepuisStorage() {
  try {
    return localStorage.getItem("menu-theme");
  } catch (e) {
    return null;
  }
}

/**
 * Sauvegarde la préférence de thème de l'utilisateur dans le localStorage.
 */
function ecrireThemeDansStorage(theme) {
  try {
    localStorage.setItem("menu-theme", theme);
  } catch (e) {
    // On ignore silencieusement si le stockage n'est pas disponible.
  }
}

/**
 * Applique un thème ("light" ou "dark") sur l'attribut data-theme du <html>.
 * Met également à jour la valeur en stockage local.
 */
function appliquerTheme(theme) {
  const html = getHtmlRootElement();
  html.setAttribute("data-theme", theme);
  ecrireThemeDansStorage(theme);
}

/**
 * Détermine le thème initial à utiliser à partir du DOM ou du stockage.
 * Retourne "light" ou "dark".
 */
function determinerThemeInitial() {
  const html = getHtmlRootElement();
  const themeStorage = lireThemeDepuisStorage();
  const themeDom = html.getAttribute("data-theme");

  if (themeStorage === "light" || themeStorage === "dark") {
    return themeStorage;
  }

  if (themeDom === "light" || themeDom === "dark") {
    return themeDom;
  }

  return "dark";
}

/**
 * Inverse le thème actuel (dark -> light, light -> dark).
 * Appelé au clic sur le bouton de bascule.
 */
function basculerTheme() {
  const html = getHtmlRootElement();
  const themeActuel = html.getAttribute("data-theme") || "dark";
  const nouveauTheme = themeActuel === "dark" ? "light" : "dark";
  appliquerTheme(nouveauTheme);
}

/**
 * Initialise la logique de bascule de thème (écouteur sur le bouton).
 */
function initialiserToggleTheme() {
  const boutonToggle = document.querySelector(".js-theme-toggle");
  if (!boutonToggle) {
    return;
  }

  const themeInitial = determinerThemeInitial();
  appliquerTheme(themeInitial);

  boutonToggle.addEventListener("click", function () {
    basculerTheme();
  });
}

/**
 * Initialise la logique des filtres (clic sur les boutons de catégorie).
 */
function initialiserFiltres(grilleElement) {
  const boutonsFiltre = Array.from(document.querySelectorAll(".js-filter"));
  if (!boutonsFiltre.length) {
    return;
  }

  mettreAJourEtatBoutonsFiltre(boutonsFiltre, state.categorieActive);

  boutonsFiltre.forEach((btn) => {
    btn.addEventListener("click", function () {
      const categorie = btn.dataset.category || "all";
      mettreAJourCategorieActive(categorie, grilleElement);
      mettreAJourEtatBoutonsFiltre(boutonsFiltre, categorie);
    });
  });
}

/**
 * Initialise les filtres de régime (vegan / sans gluten).
 */
function initialiserFiltresRegime(grilleElement) {
  const boutonsRegime = Array.from(
    document.querySelectorAll(".js-diet-filter")
  );
  if (!boutonsRegime.length) {
    return;
  }

  // On applique l'état initial sur les boutons (par défaut "all")
  mettreAJourEtatBoutonsFiltreRegime(boutonsRegime, state.filtreRegime);

  boutonsRegime.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filtre = btn.dataset.diet || "all";
      mettreAJourFiltreRegime(filtre, grilleElement);
      mettreAJourEtatBoutonsFiltreRegime(boutonsRegime, filtre);
    });
  });
}

/**
 * Initialise la barre de recherche (écoute des frappes clavier).
 */
function initialiserRecherche(grilleElement) {
  const inputRecherche = document.querySelector(".js-search");
  if (!inputRecherche) {
    return;
  }

  inputRecherche.addEventListener("input", function () {
    const valeur = inputRecherche.value || "";
    mettreAJourTermeRecherche(valeur, grilleElement);
  });
}

/**
 * Initialise le panneau des filtres de régime (bouton "Filtre" à côté de la recherche).
 */
function initialiserPanneauFiltre() {
  const boutonToggle = document.querySelector(".js-filter-toggle");
  const panneau = document.getElementById("diet-filter-panel");

  if (!boutonToggle || !panneau) {
    return;
  }

  boutonToggle.addEventListener("click", function () {
    const estOuvert = boutonToggle.getAttribute("aria-expanded") === "true";
    const nouveauEtat = !estOuvert;

    boutonToggle.setAttribute("aria-expanded", String(nouveauEtat));
    panneau.hidden = !nouveauEtat;
  });
}

/**
 * Retire les cartes HTML statiques présentes dans le markup initial.
 * Permet de ne garder que les cartes générées dynamiquement à partir du JSON.
 */
function nettoyerCartesStatiques(grilleElement) {
  const cartesStatiques = Array.from(
    grilleElement.querySelectorAll(".js-menu-card")
  );
  cartesStatiques.forEach((carte) => carte.remove());
}

/**
 * Point d'entrée principal pour initialiser toute la logique du menu.
 * Appelé lorsque le DOM est complètement chargé.
 */
function initialiserMenu() {
  const grille = document.querySelector(".js-menu-grid");
  if (!grille) {
    return;
  }

  nettoyerCartesStatiques(grille);
  initialiserToggleTheme();

  chargerDonneesMenu().then((items) => {
    state.items = items;
    const itemsFiltres = obtenirItemsFiltres();
    rendreCartesDansGrille(grille, itemsFiltres);

    initialiserFiltres(grille);
    initialiserFiltresRegime(grille);
    initialiserRecherche(grille);
    initialiserPanneauFiltre();
  });
}

/**
 * Attache l'initialisation du menu à l'événement DOMContentLoaded.
 * Garantit que le JS s'exécute une fois le HTML prêt.
 */
function attacherInitialisationMenu() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiserMenu);
  } else {
    initialiserMenu();
  }
}

// Lancement du script
attacherInitialisationMenu();


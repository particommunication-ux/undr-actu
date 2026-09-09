/* ============================================================
   UNDR Actualités — script.js
   Fonctionnalités : articles, admin, filtres, i18n, dark mode,
   adhésion, abonnement Mobile Money, publicités maison
   ============================================================ */

const MOT_DE_PASSE_ADMIN = "undr2026";
let estAdmin = sessionStorage.getItem("adminUNDR") === "true";

/* ---------- ABONNEMENT ---------- */
// Un abonné validé a la clé "abonneUNDR" = "true" dans localStorage
// + un numéro de téléphone "abonneTelUNDR"
let estAbonne = localStorage.getItem("abonneUNDR") === "true";

// Catégories LIBRES (accessibles sans abonnement)
const CATEGORIES_LIBRES = [
    "Toutes",
    "Portraits des membres du BNE",
    "Activités"
];

// Catégories PREMIUM (réservées aux abonnés)
const CATEGORIES_PREMIUM = [
    "Actualités",
    "Communiqués",
    "Actualités Tchad",
    "Actualités Politique",
    "Divertissement"
];

/* ---------- ARTICLES PAR DÉFAUT ---------- */
const articlesParDefaut = [
    {
        id: 1,
        titre: "Session parlementaire ouverte",
        date: "20 juillet 2026",
        resume: "Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.",
        categorie: "Actualités",
        image: "",
        video: "",
        premium: true
    },
    {
        id: 2,
        titre: "Visite de terrain dans la région Nord",
        date: "15 juillet 2026",
        resume: "Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.",
        categorie: "Activités",
        image: "",
        video: "",
        premium: false
    },
    {
        id: 3,
        titre: "Déclaration officielle du groupe",
        date: "10 juillet 2026",
        resume: "Le groupe a publié une déclaration concernant les récents débats budgétaires.",
        categorie: "Communiqués",
        image: "",
        video: "",
        premium: true
    }
];

let articles = JSON.parse(localStorage.getItem("articlesUNDR")) || articlesParDefaut;
let categorieActuelle = "Toutes";

const conteneur = document.getElementById("liste-articles");
const boutonsFiltre = document.querySelectorAll(".filtre-btn:not(.filtre-adherer)");
const menuToggle = document.getElementById("menu-toggle");
const filtresList = document.getElementById("filtres-list");
/* bouton admin géré dans le menu gauche */
const boutonAdmin = { textContent: "" }; // placeholder inactif
const formulaireAjout = document.getElementById("formulaire-ajout");

/* ============================================================
   TRADUCTIONS
   ============================================================ */
const traductions = {
    fr: {
        soustitre: "Actualités et activités du Groupe Parlementaire UNDR",
        form_titre: "Ajouter un article",
        btn_publier: "Publier",
        btn_retour: "← Retour",
        chat_titre: "Chat en direct",
        btn_envoyer: "Envoyer",
        btn_partager: "📤 Partager l'application",
        btn_admin_ouvrir: "🔒 Mode admin",
        btn_admin_fermer: "🔓 Quitter mode admin",
        btn_direct_ouvrir: "🔴 Suivre le Direct",
        btn_direct_fermer: "✖ Fermer le Direct",
        lire_aussi: "Lire aussi"
    },
    en: {
        soustitre: "News and activities of the UNDR Parliamentary Group",
        form_titre: "Add an article",
        btn_publier: "Publish",
        btn_retour: "← Back",
        chat_titre: "Live Chat",
        btn_envoyer: "Send",
        btn_partager: "📤 Share the app",
        btn_admin_ouvrir: "🔒 Admin mode",
        btn_admin_fermer: "🔓 Exit admin mode",
        btn_direct_ouvrir: "🔴 Watch Live",
        btn_direct_fermer: "✖ Close Live",
        lire_aussi: "Read also"
    },
    ar: {
        soustitre: "أخبار وأنشطة المجموعة البرلمانية UNDR",
        form_titre: "إضافة مقال",
        btn_publier: "نشر",
        btn_retour: "→ رجوع",
        chat_titre: "دردشة مباشرة",
        btn_envoyer: "إرسال",
        btn_partager: "📤 مشاركة التطبيق",
        btn_admin_ouvrir: "🔒 وضع المسؤول",
        btn_admin_fermer: "🔓 الخروج من وضع المسؤول",
        btn_direct_ouvrir: "🔴 متابعة البث المباشر",
        btn_direct_fermer: "✖ إغلاق البث المباشر",
        lire_aussi: "اقرأ أيضاً"
    }
};

let langueActuelle = localStorage.getItem("langueUNDR") || "fr";

/* ============================================================
   ADMIN
   ============================================================ */
function metAJourAffichageAdmin() {
    if (estAdmin) {
        formulaireAjout.style.display = "block";
        boutonAdmin.textContent = traductions[langueActuelle].btn_admin_fermer;
        chargerAdhesionsAdmin();
        chargerAbonnesAdmin();
        chargerPubsAdmin();
    } else {
        formulaireAjout.style.display = "none";
        boutonAdmin.textContent = traductions[langueActuelle].btn_admin_ouvrir;
    }
}

/* Admin : géré dans le menu gauche (menu-btn-admin) */

/* ============================================================
   MENU FILTRES
   ============================================================ */
menuToggle.addEventListener("click", function () {
    filtresList.classList.toggle("ouvert");
});

/* ============================================================
   ABONNEMENT — BANDEAU ET STATUT
   ============================================================ */
function mettreAJourBandeauAbo() {
    const bandeau = document.getElementById("bandeau-abonnement");
    if (!estAbonne && !estAdmin) {
        bandeau.style.display = "flex";
    } else {
        bandeau.style.display = "none";
    }

    // Statut dans le panneau paramètres
    const statut = document.getElementById("statut-abonnement-panneau");
    if (statut) {
        if (estAbonne) {
            statut.innerHTML = `<div class="statut-abo actif">💎 Abonnement actif</div>
                <button id="btn-resil-abo" class="btn-resilier">Se désabonner</button>`;
            document.getElementById("btn-resil-abo").addEventListener("click", function () {
                if (confirm("Voulez-vous vraiment vous désabonner ?")) {
                    localStorage.removeItem("abonneUNDR");
                    localStorage.removeItem("abonneTelUNDR");
                    estAbonne = false;
                    mettreAJourBandeauAbo();
                    afficherArticles();
                    alert("Vous êtes désabonné. À bientôt !");
                }
            });
        } else {
            statut.innerHTML = `<div class="statut-abo inactif">🔒 Pas d'abonnement actif</div>
                <button class="btn-payer" id="btn-abo-panneau" style="margin-top:8px;">S'abonner — 1 000 FCFA/mois</button>`;
            document.getElementById("btn-abo-panneau").addEventListener("click", function () {
                fermerMenuGauche();
                ouvrirModalAbonnement();
            });
        }
    }
}

/* ============================================================
   AFFICHAGE DES ARTICLES
   ============================================================ */
function estArticlePremium(art) {
    return art.premium === true || CATEGORIES_PREMIUM.includes(art.categorie);
}

function afficherArticles() {
    conteneur.innerHTML = "";
    let liste = articles.filter(function (a) {
        return categorieActuelle === "Toutes" || a.categorie === categorieActuelle;
    });

    liste.forEach(function (art, i) {
        const div = document.createElement("div");
        const premium = estArticlePremium(art);
        const verrouilleComp = premium && !estAbonne && !estAdmin;

        div.className = i === 0 ? "article une" : "article";
        if (verrouilleComp) div.classList.add("article-verrou");
        div.dataset.id = art.id;

        const imageSrc = art.image && art.image !== ""
            ? art.image
            : `https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200`;

        const badgePremium = premium ? `<span class="badge-premium">🔒 Premium</span>` : "";
        const iconeVerrou = verrouilleComp
            ? `<div class="carte-verrou-overlay"><span>🔒</span><small>Abonnez-vous pour lire</small></div>`
            : "";

        div.innerHTML = `
            <img src="${imageSrc}" class="article-img${verrouilleComp ? " img-floue" : ""}" alt="${art.titre}">
            ${iconeVerrou}
            <span class="badge">${art.categorie}</span>
            ${badgePremium}
            <h2>${art.titre}</h2>
            ${estAdmin ? `
                <button class="btn-supprimer" data-id="${art.id}">Supprimer</button>
                <button class="btn-modifier" data-id="${art.id}">Modifier</button>
            ` : ""}
        `;
        conteneur.appendChild(div);
    });
}

/* ============================================================
   VUES (Firebase)
   ============================================================ */
function incrementerVue(id) {
    if (!window.db) return;
    const ref = window.db.collection("vues").doc(String(id));
    ref.get().then(function (doc) {
        if (doc.exists) {
            ref.update({ compte: firebase.firestore.FieldValue.increment(1) });
        } else {
            ref.set({ compte: 1 });
        }
    });
}

function afficherVue(id) {
    if (!window.db) return;
    window.db.collection("vues").doc(String(id)).onSnapshot(function (doc) {
        const compte = doc.exists ? doc.data().compte : 0;
        const elem = document.getElementById("detail-vues");
        if (elem) elem.textContent = compte + (compte > 1 ? " vues" : " vue");
    });
}

/* ============================================================
   LIRE AUSSI
   ============================================================ */
function afficherLireAussi(articleActuel) {
    const zone = document.getElementById("lire-aussi");
    if (!zone) return;

    let suggestions = articles.filter(function (a) {
        return a.id !== articleActuel.id && a.categorie === articleActuel.categorie;
    });

    if (suggestions.length < 3) {
        const autres = articles.filter(function (a) {
            return a.id !== articleActuel.id && a.categorie !== articleActuel.categorie;
        });
        suggestions = suggestions.concat(autres);
    }

    suggestions = suggestions.slice(0, 3);

    if (suggestions.length === 0) {
        zone.innerHTML = "";
        return;
    }

    let html = `<h3>${traductions[langueActuelle].lire_aussi}</h3><div class='lire-aussi-grille'>`;
    suggestions.forEach(function (art) {
        const imageSrc = art.image && art.image !== ""
            ? art.image
            : `https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200`;
        const premium = estArticlePremium(art);
        const verrouille = premium && !estAbonne && !estAdmin;

        html += `
            <div class="lire-aussi-carte${verrouille ? " carte-premium" : ""}" data-id="${art.id}">
                <img src="${imageSrc}" alt="${art.titre}" ${verrouille ? 'style="filter:blur(3px)"' : ""}>
                <p>${verrouille ? "🔒 " : ""}${art.titre}</p>
            </div>
        `;
    });
    html += "</div>";

    zone.innerHTML = html;

    zone.querySelectorAll(".lire-aussi-carte").forEach(function (carte) {
        carte.addEventListener("click", function () {
            ouvrirArticle(Number(carte.dataset.id));
        });
    });
}

/* ============================================================
   OUVRIR UN ARTICLE
   ============================================================ */
function ouvrirArticle(id) {
    const art = articles.find(function (a) { return a.id === id; });
    if (!art) return;

    const premium = estArticlePremium(art);
    const verrouilleComp = premium && !estAbonne && !estAdmin;

    const imageSrc = art.image && art.image !== ""
        ? art.image
        : `https://picsum.photos/seed/${encodeURIComponent(art.titre)}/400/200`;

    document.getElementById("detail-img").src = imageSrc;
    document.getElementById("detail-img").style.filter = verrouilleComp ? "blur(6px)" : "none";
    document.getElementById("detail-badge").textContent = art.categorie;
    document.getElementById("detail-titre").textContent = art.titre;
    document.getElementById("detail-date").textContent = art.date;

    // Contenu : flou si premium et non abonné
    const detailResume = document.getElementById("detail-resume");
    if (verrouilleComp) {
        detailResume.textContent = art.resume.substring(0, 80) + "...";
        detailResume.style.filter = "blur(4px)";
        detailResume.style.userSelect = "none";
    } else {
        detailResume.textContent = art.resume;
        detailResume.style.filter = "none";
        detailResume.style.userSelect = "";
    }

    // Verrou premium
    const verrou = document.getElementById("verrou-premium");
    if (verrouilleComp) {
        verrou.style.display = "flex";
    } else {
        verrou.style.display = "none";
    }

    // Vidéo
    const zoneVideo = document.getElementById("detail-video-zone");
    zoneVideo.innerHTML = "";
    if (!verrouilleComp && art.video && art.video !== "") {
        if (art.video.includes("youtube.com") || art.video.includes("youtu.be")) {
            const idVideo = art.video.split("v=")[1]
                ? art.video.split("v=")[1].split("&")[0]
                : art.video.split("/").pop();
            zoneVideo.innerHTML = `<iframe class="article-video" src="https://www.youtube.com/embed/${idVideo}" frameborder="0" allowfullscreen></iframe>`;
        } else if (art.video.includes("facebook.com")) {
            const lienEncode = encodeURIComponent(art.video);
            if (art.video.includes("/videos/") || art.video.includes("/watch")) {
                zoneVideo.innerHTML = `<iframe class="article-video" src="https://www.facebook.com/plugins/video.php?href=${lienEncode}&show_text=false" frameborder="0" allowfullscreen></iframe>`;
            } else {
                zoneVideo.innerHTML = `<iframe class="article-video-facebook" src="https://www.facebook.com/plugins/post.php?href=${lienEncode}&show_text=true" frameborder="0"></iframe>`;
            }
        } else {
            zoneVideo.innerHTML = `<video class="article-video" src="${art.video}" controls></video>`;
        }
    }

    conteneur.style.display = "none";
    filtresList.style.display = "none";
    menuToggle.style.display = "none";
    document.getElementById("vue-detail").style.display = "block";

    incrementerVue(id);
    afficherVue(id);
    afficherLireAussi(art);
}

document.getElementById("retour-liste").addEventListener("click", function () {
    document.getElementById("vue-detail").style.display = "none";
    conteneur.style.display = "grid";
    filtresList.style.display = "flex";
    menuToggle.style.display = "none";
});

// Bouton abonnement depuis le verrou dans la vue détail
document.getElementById("btn-abo-verrou").addEventListener("click", function () {
    ouvrirModalAbonnement();
});

// Bandeau abonnement
document.getElementById("bandeau-btn-abo").addEventListener("click", function () {
    ouvrirModalAbonnement();
});

/* ============================================================
   FILTRES
   ============================================================ */
boutonsFiltre.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        boutonsFiltre.forEach(function (b) { b.classList.remove("actif"); });
        bouton.classList.add("actif");
        categorieActuelle = bouton.dataset.categorie;
        afficherArticles();
    });
});

afficherArticles();

/* ============================================================
   SWIPE HORIZONTAL
   ============================================================ */
let toucheDebutX = 0;
let toucheDebutY = 0;

conteneur.addEventListener("touchstart", function (e) {
    toucheDebutX = e.changedTouches[0].screenX;
    toucheDebutY = e.changedTouches[0].screenY;
});

conteneur.addEventListener("touchend", function (e) {
    const toucheFinX = e.changedTouches[0].screenX;
    const toucheFinY = e.changedTouches[0].screenY;
    const diffX = toucheFinX - toucheDebutX;
    const diffY = toucheFinY - toucheDebutY;

    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
        const boutons = Array.from(boutonsFiltre);
        const indexActuel = boutons.findIndex(function (b) { return b.classList.contains("actif"); });
        let nouvelIndex = diffX < 0
            ? Math.min(indexActuel + 1, boutons.length - 1)
            : Math.max(indexActuel - 1, 0);
        if (nouvelIndex !== indexActuel) boutons[nouvelIndex].click();
    }
});

/* ============================================================
   FORMULAIRE D'AJOUT D'ARTICLE
   ============================================================ */
const champTitre = document.getElementById("nouveau-titre");
const champCategorie = document.getElementById("nouvelle-categorie");
const champResume = document.getElementById("nouveau-resume");
const boutonPublier = document.getElementById("bouton-publier");
const champImage = document.getElementById("nouvelle-image");
const champVideo = document.getElementById("nouvelle-video");
const champPremium = document.getElementById("article-premium");

let modeEdition = false;
let idEdition = null;

boutonPublier.addEventListener("click", function () {
    if (champTitre.value === "" || champResume.value === "") {
        alert("Merci de remplir le titre et le résumé.");
        return;
    }

    function publier(imageData) {
        if (modeEdition && idEdition !== null) {
            // Mode modification
            const index = articles.findIndex(function (a) { return a.id === idEdition; });
            if (index !== -1) {
                articles[index].titre = champTitre.value;
                articles[index].resume = champResume.value;
                articles[index].categorie = champCategorie.value;
                articles[index].video = champVideo.value.trim();
                articles[index].premium = champPremium.checked;
                if (imageData) articles[index].image = imageData;
            }
            modeEdition = false;
            idEdition = null;
            boutonPublier.textContent = traductions[langueActuelle].btn_publier;
        } else {
            // Nouveau article
            const nouvelArticle = {
                id: Date.now(),
                titre: champTitre.value,
                date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
                resume: champResume.value,
                categorie: champCategorie.value,
                image: imageData || "",
                video: champVideo.value.trim(),
                premium: champPremium.checked
            };
            articles.unshift(nouvelArticle);
        }

        localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        champTitre.value = "";
        champResume.value = "";
        champVideo.value = "";
        champImage.value = "";
        champPremium.checked = false;
        afficherArticles();
    }

    if (champImage.files && champImage.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) { publier(e.target.result); };
        reader.readAsDataURL(champImage.files[0]);
    } else {
        publier(null);
    }
});

/* ============================================================
   CLIC SUR UNE CARTE (supprimer / modifier / ouvrir)
   ============================================================ */
conteneur.addEventListener("click", function (e) {
    // Supprimer
    if (e.target.classList.contains("btn-supprimer")) {
        const id = Number(e.target.dataset.id);
        if (confirm("Supprimer cet article ?")) {
            articles = articles.filter(function (a) { return a.id !== id; });
            localStorage.setItem("articlesUNDR", JSON.stringify(articles));
            afficherArticles();
        }
        return;
    }

    // Modifier
    if (e.target.classList.contains("btn-modifier")) {
        const id = Number(e.target.dataset.id);
        const art = articles.find(function (a) { return a.id === id; });
        if (!art) return;
        champTitre.value = art.titre;
        champResume.value = art.resume;
        champCategorie.value = art.categorie;
        champVideo.value = art.video || "";
        champPremium.checked = art.premium === true;
        modeEdition = true;
        idEdition = id;
        boutonPublier.textContent = "Enregistrer les modifications";
        formulaireAjout.scrollIntoView({ behavior: "smooth" });
        return;
    }

    // Ouvrir article
    const carte = e.target.closest(".article");
    if (carte) {
        const id = Number(carte.dataset.id);
        const art = articles.find(function (a) { return a.id === id; });
        if (art && estArticlePremium(art) && !estAbonne && !estAdmin) {
            // Clic sur article verrouillé → proposer abonnement
            ouvrirModalAbonnement();
            return;
        }
        ouvrirArticle(id);
    }
});

/* ============================================================
   BOUTON DIRECT FACEBOOK
   ============================================================ */
const boutonDirectEl = document.getElementById("toggle-direct");
if (boutonDirectEl) {
    boutonDirectEl.addEventListener("click", function () {
        const zone = document.getElementById("zone-direct");
        if (zone.style.display === "none") {
            zone.style.display = "block";
            this.textContent = traductions[langueActuelle].btn_direct_fermer;
        } else {
            zone.style.display = "none";
            this.textContent = traductions[langueActuelle].btn_direct_ouvrir;
        }
    });
}

/* Partager : géré dans le menu gauche (menu-btn-partager) */

/* ============================================================
   LANGUE
   ============================================================ */
function appliquerLangue(lang) {
    langueActuelle = lang;
    localStorage.setItem("langueUNDR", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
        const cle = el.getAttribute("data-i18n");
        if (traductions[lang][cle]) el.textContent = traductions[lang][cle];
    });
    metAJourAffichageAdmin();
}

document.querySelectorAll(".lang-btn").forEach(function (bouton) {
    bouton.addEventListener("click", function () { appliquerLangue(bouton.dataset.lang); });
});

/* ============================================================
   MODE SOMBRE
   ============================================================ */
const toggleSombre = document.getElementById("toggle-sombre");
if (toggleSombre) {
    if (localStorage.getItem("modeSombreUNDR") === "true") {
        document.body.classList.add("mode-sombre");
        toggleSombre.checked = true;
    }
    toggleSombre.addEventListener("change", function () {
        document.body.classList.toggle("mode-sombre", toggleSombre.checked);
        localStorage.setItem("modeSombreUNDR", toggleSombre.checked);
    });
}

/* ============================================================
   TAILLE DU TEXTE
   ============================================================ */
function appliquerTailleTexte(niveau) {
    const tailles = { petit: "14px", normal: "16px", grand: "19px" };
    document.body.style.fontSize = tailles[niveau] || "16px";
    localStorage.setItem("tailleTexteUNDR", niveau);
}
document.querySelectorAll(".taille-btn").forEach(function (bouton) {
    bouton.addEventListener("click", function () { appliquerTailleTexte(bouton.dataset.taille); });
});
appliquerTailleTexte(localStorage.getItem("tailleTexteUNDR") || "normal");

/* ============================================================
   MENU GAUCHE (tiroir)
   ============================================================ */
function ouvrirMenuGauche() {
    mettreAJourBandeauAbo();
    document.getElementById("menu-gauche").style.display = "block";
    document.getElementById("overlay-menu-gauche").style.display = "block";
}
function fermerMenuGauche() {
    document.getElementById("menu-gauche").style.display = "none";
    document.getElementById("overlay-menu-gauche").style.display = "none";
}

document.getElementById("ouvrir-menu-gauche").addEventListener("click", ouvrirMenuGauche);
document.getElementById("fermer-menu-gauche").addEventListener("click", fermerMenuGauche);
document.getElementById("overlay-menu-gauche").addEventListener("click", fermerMenuGauche);

// Bouton Admin dans le menu gauche
document.getElementById("menu-btn-admin").addEventListener("click", function () {
    fermerMenuGauche();
    if (estAdmin) {
        estAdmin = false;
        sessionStorage.removeItem("adminUNDR");
    } else {
        const saisie = prompt("Mot de passe administrateur :");
        if (saisie === MOT_DE_PASSE_ADMIN) {
            estAdmin = true;
            sessionStorage.setItem("adminUNDR", "true");
        } else if (saisie !== null) {
            alert("Mot de passe incorrect.");
        }
    }
    metAJourAffichageAdmin();
    afficherArticles();
});

// Bouton Partager dans le menu gauche
document.getElementById("menu-btn-partager").addEventListener("click", function () {
    fermerMenuGauche();
    const lien = window.location.href;
    if (navigator.share) {
        navigator.share({ title: "UNDR Actualités", url: lien });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(lien).then(function () { alert("Lien copié !"); });
    } else {
        prompt("Copiez ce lien :", lien);
    }
});

// Bouton Adhérer dans le menu gauche
document.getElementById("menu-btn-adherer").addEventListener("click", function () {
    fermerMenuGauche();
    ouvrirModalAdhesion();
});

// Bouton S'abonner dans le menu gauche
document.getElementById("menu-btn-abonner").addEventListener("click", function () {
    fermerMenuGauche();
    ouvrirModalAbonnement();
});

/* ============================================================
   MODAL ADHÉSION
   ============================================================ */
function ouvrirModalAdhesion() {
    document.getElementById("etape-adhesion-1").style.display = "block";
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-3").style.display = "none";
    document.getElementById("adh-nom").value = "";
    document.getElementById("adh-naissance").value = "";
    document.getElementById("adh-tel").value = "";
    document.getElementById("adh-region").value = "";
    document.getElementById("apercu-photo").innerHTML = "";
    document.getElementById("adh-accord").checked = false;
    document.getElementById("modal-adhesion").style.display = "flex";
}

function fermerModalAdhesion() {
    document.getElementById("modal-adhesion").style.display = "none";
}

// Bouton Adhérer dans le bandeau
document.getElementById("bandeau-btn-adherer").addEventListener("click", ouvrirModalAdhesion);
document.getElementById("fermer-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("fermer-succes-adhesion").addEventListener("click", fermerModalAdhesion);

// Aperçu photo d'identité
document.getElementById("adh-photo").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        alert("La photo ne doit pas dépasser 2 Mo.");
        this.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("apercu-photo").innerHTML =
            `<img src="${e.target.result}" alt="Aperçu" style="max-width:100%; max-height:120px; border-radius:6px; margin-top:6px;">`;
    };
    reader.readAsDataURL(file);
});

// Étape 1 → 2 (validation)
document.getElementById("btn-suivant-adhesion").addEventListener("click", function () {
    const nom = document.getElementById("adh-nom").value.trim();
    const naissance = document.getElementById("adh-naissance").value;
    const tel = document.getElementById("adh-tel").value.trim();
    const region = document.getElementById("adh-region").value.trim();
    const photo = document.getElementById("adh-photo").files[0];

    if (!nom || !naissance || !tel || !region || !photo) {
        alert("Merci de remplir tous les champs obligatoires (*).");
        return;
    }

    // Récapitulatif
    const recapEl = document.getElementById("recapitulatif-adhesion");
    recapEl.innerHTML = `
        <div class="recap-ligne"><span>Nom :</span> <strong>${nom}</strong></div>
        <div class="recap-ligne"><span>Date de naissance :</span> <strong>${naissance}</strong></div>
        <div class="recap-ligne"><span>Téléphone :</span> <strong>${tel}</strong></div>
        <div class="recap-ligne"><span>Région :</span> <strong>${region}</strong></div>
        <div class="recap-ligne"><span>Photo :</span> <strong>✅ Fichier joint</strong></div>
    `;

    document.getElementById("etape-adhesion-1").style.display = "none";
    document.getElementById("etape-adhesion-2").style.display = "block";
});

// Étape 2 → 1 (retour)
document.getElementById("btn-retour-adhesion").addEventListener("click", function () {
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-1").style.display = "block";
});

// Soumettre adhésion
document.getElementById("btn-soumettre-adhesion").addEventListener("click", function () {
    if (!document.getElementById("adh-accord").checked) {
        alert("Vous devez accepter la charte de l'UNDR pour continuer.");
        return;
    }

    const nom = document.getElementById("adh-nom").value.trim();
    const naissance = document.getElementById("adh-naissance").value;
    const tel = document.getElementById("adh-tel").value.trim();
    const region = document.getElementById("adh-region").value.trim();
    const numeroDossier = "UNDR-" + Date.now().toString().slice(-6);

    // Sauvegarde locale (l'admin verra la liste)
    const demandes = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];
    demandes.push({
        id: numeroDossier,
        nom: nom,
        naissance: naissance,
        tel: tel,
        region: region,
        date: new Date().toLocaleDateString("fr-FR"),
        statut: "En attente"
    });
    localStorage.setItem("adhesionsUNDR", JSON.stringify(demandes));

    // Sauvegarde Firebase si disponible
    if (window.db) {
        window.db.collection("adhesions").add({
            id: numeroDossier,
            nom: nom,
            naissance: naissance,
            tel: tel,
            region: region,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            statut: "En attente"
        });
    }

    document.getElementById("num-dossier").textContent = numeroDossier;
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-3").style.display = "block";
});

/* ============================================================
   MODAL ABONNEMENT
   ============================================================ */
function ouvrirModalAbonnement() {
    // Réinitialiser
    document.getElementById("etape-paiement-1").style.display = "block";
    document.getElementById("etape-paiement-2").style.display = "none";
    document.getElementById("etape-paiement-3").style.display = "none";
    document.getElementById("abo-nom").value = "";
    document.getElementById("abo-tel").value = "";
    document.getElementById("abo-operateur").value = "";
    document.getElementById("code-confirmation").value = "";
    document.getElementById("modal-abonnement").style.display = "flex";
}

function fermerModalAbonnement() {
    document.getElementById("modal-abonnement").style.display = "none";
}

// Bouton S'abonner depuis le bandeau

document.getElementById("fermer-abonnement").addEventListener("click", fermerModalAbonnement);
document.getElementById("fermer-succes-abo").addEventListener("click", function () {
    fermerModalAbonnement();
    afficherArticles();
    mettreAJourBandeauAbo();
});

// Étape 1 paiement → instructions Mobile Money
document.getElementById("btn-payer").addEventListener("click", function () {
    const nom = document.getElementById("abo-nom").value.trim();
    const tel = document.getElementById("abo-tel").value.trim();
    const operateur = document.getElementById("abo-operateur").value;

    if (!nom || !tel || !operateur) {
        alert("Merci de remplir tous les champs.");
        return;
    }

    // Générer référence unique
    const ref = operateur.replace(" ", "").toUpperCase().slice(0, 3) + "-" + Date.now().toString().slice(-6);
    document.getElementById("ref-paiement").textContent = ref;

    document.getElementById("etape-paiement-1").style.display = "none";
    document.getElementById("etape-paiement-2").style.display = "block";
});

// Valider code de confirmation
document.getElementById("btn-valider-paiement").addEventListener("click", function () {
    const code = document.getElementById("code-confirmation").value.trim();
    if (!code) {
        alert("Entrez le code de confirmation reçu par SMS.");
        return;
    }

    const nom = document.getElementById("abo-nom").value.trim();
    const tel = document.getElementById("abo-tel").value.trim();
    const operateur = document.getElementById("abo-operateur").value;
    const ref = document.getElementById("ref-paiement").textContent;

    // Enregistrement de la demande d'abonnement (en attente de validation admin)
    const abonnes = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
    abonnes.push({
        nom: nom,
        tel: tel,
        operateur: operateur,
        ref: ref,
        code: code,
        date: new Date().toLocaleDateString("fr-FR"),
        statut: "En attente"
    });
    localStorage.setItem("abonnesUNDR", JSON.stringify(abonnes));

    // Sauvegarde Firebase
    if (window.db) {
        window.db.collection("abonnements").add({
            nom: nom,
            tel: tel,
            operateur: operateur,
            ref: ref,
            code: code,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            statut: "En attente"
        });
    }

    // SIMULATION — En production, l'admin valide manuellement via le panneau.
    // Pour les tests, on peut activer directement :
    // localStorage.setItem("abonneUNDR", "true");
    // estAbonne = true;

    document.getElementById("etape-paiement-2").style.display = "none";
    document.getElementById("etape-paiement-3").style.display = "block";
});

/* ============================================================
   ADMIN — LISTES ADHÉSIONS ET ABONNÉS
   ============================================================ */
function chargerAdhesionsAdmin() {
    const zone = document.getElementById("liste-adhesions");
    if (!zone) return;
    const demandes = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];

    if (demandes.length === 0) {
        zone.innerHTML = "<p style='color:#888;'>Aucune demande d'adhésion.</p>";
        return;
    }

    let html = "";
    demandes.forEach(function (d, i) {
        html += `
            <div class="adhesion-item">
                <strong>${d.nom}</strong> — ${d.region} — 📞 ${d.tel}<br>
                <small>Né le ${d.naissance} | Dossier : ${d.id} | Reçu le ${d.date}</small><br>
                <span class="badge-statut ${d.statut === "Validé" ? "valide" : "attente"}">${d.statut}</span>
                ${d.statut !== "Validé" ? `<button class="btn-valider-adhesion" data-index="${i}">✅ Valider</button>` : ""}
                <button class="btn-suppr-adhesion" data-index="${i}">🗑 Supprimer</button>
            </div>
        `;
    });
    zone.innerHTML = html;

    zone.querySelectorAll(".btn-valider-adhesion").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const demandes2 = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];
            demandes2[Number(btn.dataset.index)].statut = "Validé";
            localStorage.setItem("adhesionsUNDR", JSON.stringify(demandes2));
            chargerAdhesionsAdmin();
        });
    });

    zone.querySelectorAll(".btn-suppr-adhesion").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const demandes2 = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];
            demandes2.splice(Number(btn.dataset.index), 1);
            localStorage.setItem("adhesionsUNDR", JSON.stringify(demandes2));
            chargerAdhesionsAdmin();
        });
    });
}

function chargerAbonnesAdmin() {
    const zone = document.getElementById("liste-abonnes");
    if (!zone) return;
    const abonnes = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];

    if (abonnes.length === 0) {
        zone.innerHTML = "<p style='color:#888;'>Aucun abonné en attente.</p>";
        return;
    }

    let html = "";
    abonnes.forEach(function (a, i) {
        html += `
            <div class="adhesion-item">
                <strong>${a.nom}</strong> — ${a.operateur} — 📞 ${a.tel}<br>
                <small>Réf : ${a.ref} | Code : ${a.code} | Le ${a.date}</small><br>
                <span class="badge-statut ${a.statut === "Validé" ? "valide" : "attente"}">${a.statut}</span>
                ${a.statut !== "Validé" ? `<button class="btn-activer-abo" data-index="${i}">✅ Activer accès</button>` : ""}
                <button class="btn-suppr-abo" data-index="${i}">🗑 Supprimer</button>
            </div>
        `;
    });
    zone.innerHTML = html;

    zone.querySelectorAll(".btn-activer-abo").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const abonnes2 = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
            abonnes2[Number(btn.dataset.index)].statut = "Validé";
            localStorage.setItem("abonnesUNDR", JSON.stringify(abonnes2));
            // Note : pour activer sur cet appareil précis, on met à jour le flag
            // En production réelle, utiliser Firebase Auth ou Firestore pour gérer par téléphone
            chargerAbonnesAdmin();
            alert("Accès activé pour " + abonnes2[Number(btn.dataset.index)].nom + ".\n\nPour activer sur son appareil, l'utilisateur doit entrer son numéro de téléphone dans la vérification.");
        });
    });

    zone.querySelectorAll(".btn-suppr-abo").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const abonnes2 = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
            abonnes2.splice(Number(btn.dataset.index), 1);
            localStorage.setItem("abonnesUNDR", JSON.stringify(abonnes2));
            chargerAbonnesAdmin();
        });
    });
}

/* ============================================================
   PUBLICITÉS MAISON
   ============================================================ */
function chargerPubsAdmin() {
    // Charger valeurs existantes dans le formulaire admin
    const pubHaut = JSON.parse(localStorage.getItem("pubHautUNDR") || "null");
    const pubBas = JSON.parse(localStorage.getItem("pubBasUNDR") || "null");

    if (pubHaut) {
        document.getElementById("pub-haut-titre").value = pubHaut.titre || "";
        document.getElementById("pub-haut-lien").value = pubHaut.lien || "";
    }
    if (pubBas) {
        document.getElementById("pub-bas-titre").value = pubBas.titre || "";
        document.getElementById("pub-bas-lien").value = pubBas.lien || "";
    }
}

function afficherPubMaison(zone, data) {
    if (!data || !data.image) { zone.style.display = "none"; return; }
    zone.style.display = "block";
    zone.innerHTML = `
        <a href="${data.lien || "#"}" target="_blank" rel="noopener" class="pub-maison-lien">
            <img src="${data.image}" alt="${data.titre || "Publicité"}" class="pub-maison-img">
            ${data.titre ? `<span class="pub-maison-titre">${data.titre}</span>` : ""}
            <span class="pub-label">Publicité</span>
        </a>
    `;
}

function rafraichirPubs() {
    const pubHaut = JSON.parse(localStorage.getItem("pubHautUNDR") || "null");
    const pubBas = JSON.parse(localStorage.getItem("pubBasUNDR") || "null");
    afficherPubMaison(document.getElementById("pub-maison-haut"), pubHaut);
    afficherPubMaison(document.getElementById("pub-maison-bas"), pubBas);
}

function enregistrerPub(cle, titreId, lienId, imageId) {
    const titre = document.getElementById(titreId).value.trim();
    const lien = document.getElementById(lienId).value.trim();
    const fichier = document.getElementById(imageId).files[0];

    function sauver(imageData) {
        const data = { titre: titre, lien: lien, image: imageData };
        localStorage.setItem(cle, JSON.stringify(data));
        rafraichirPubs();
        alert("Publicité enregistrée !");
    }

    if (fichier) {
        const reader = new FileReader();
        reader.onload = function (e) { sauver(e.target.result); };
        reader.readAsDataURL(fichier);
    } else {
        // Garder l'image existante si pas de nouveau fichier
        const existant = JSON.parse(localStorage.getItem(cle) || "null");
        sauver(existant ? existant.image : "");
    }
}

document.getElementById("btn-sauver-pub-haut").addEventListener("click", function () {
    enregistrerPub("pubHautUNDR", "pub-haut-titre", "pub-haut-lien", "pub-haut-image");
});

document.getElementById("btn-sauver-pub-bas").addEventListener("click", function () {
    enregistrerPub("pubBasUNDR", "pub-bas-titre", "pub-bas-lien", "pub-bas-image");
});

// Charger les pubs au démarrage
rafraichirPubs();

/* ============================================================
   VÉRIFICATION ABONNEMENT PAR TÉLÉPHONE
   (Pour que l'abonné valide sur son appareil)
   ============================================================ */
function verifierAbonnementTel() {
    const tel = prompt("Entrez votre numéro de téléphone pour vérifier votre abonnement :");
    if (!tel) return;

    const abonnes = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
    const trouve = abonnes.find(function (a) {
        return a.tel.replace(/\s/g, "") === tel.replace(/\s/g, "") && a.statut === "Validé";
    });

    if (trouve) {
        localStorage.setItem("abonneUNDR", "true");
        localStorage.setItem("abonneTelUNDR", tel);
        estAbonne = true;
        mettreAJourBandeauAbo();
        afficherArticles();
        alert("✅ Abonnement activé ! Bienvenue, " + trouve.nom + " !");
    } else {
        alert("❌ Numéro non trouvé ou abonnement non encore validé.\nContactez-nous au +235 66 79 77 51.");
    }
}

/* ============================================================
   INITIALISATION
   ============================================================ */
appliquerLangue(langueActuelle);
mettreAJourBandeauAbo();

// Fermer modals en cliquant sur l'overlay
document.getElementById("modal-adhesion").addEventListener("click", function (e) {
    if (e.target === this) fermerModalAdhesion();
});
document.getElementById("modal-abonnement").addEventListener("click", function (e) {
    if (e.target === this) fermerModalAbonnement();
});

/* ============================================================
   SERVICE WORKER
   ============================================================ */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

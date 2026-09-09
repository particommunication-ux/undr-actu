/* ============================================================
   UNDR Actualités — script.js — Version complète corrigée
   Corrections : bouton admin visible, DOMContentLoaded, ordre scripts
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

const MOT_DE_PASSE_ADMIN = "undr2026";
let estAdmin = sessionStorage.getItem("adminUNDR") === "true";
let estAbonne = localStorage.getItem("abonneUNDR") === "true";

const CATEGORIES_PREMIUM = ["Actualités","Communiqués","Actualités Tchad","Actualités Politique","Divertissement"];

const articlesParDefaut = [
    { id: 1, titre: "Session parlementaire ouverte", date: "20 juillet 2026", contenu: "Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.", categorie: "Actualités", image: "", video: "", premium: true },
    { id: 2, titre: "Visite de terrain dans la région Nord", date: "15 juillet 2026", contenu: "Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.", categorie: "Activités", image: "", video: "", premium: false },
    { id: 3, titre: "Déclaration officielle du groupe", date: "10 juillet 2026", contenu: "Le groupe a publié une déclaration concernant les récents débats budgétaires.", categorie: "Communiqués", image: "", video: "", premium: true }
];

let articles = JSON.parse(localStorage.getItem("articlesUNDR")) || articlesParDefaut;
let categorieActuelle = "Toutes";
let modeEdition = false;
let idEdition = null;

const conteneur = document.getElementById("liste-articles");
const boutonsFiltre = document.querySelectorAll(".filtre-btn");

/* ============================================================
   ADMIN — POINT ORANGE SECRET
   ============================================================ */
function mettreAJourPointAdmin() {
    // Point dans le menu gauche
    const point = document.getElementById("point-admin");
    if (point) {
        point.textContent = estAdmin ? "●" : "●";
        point.style.color = estAdmin ? "#e63946" : "#e67e22";
        point.title = estAdmin ? "Admin actif — cliquer pour quitter" : "Accès admin";
    }
    // Bouton ⚙ dans le header
    const btnHeader = document.getElementById("btn-admin-header");
    if (btnHeader) {
        btnHeader.title = estAdmin ? "Admin actif — cliquer pour quitter" : "Accès administrateur";
        if (estAdmin) {
            btnHeader.classList.add("admin-actif");
        } else {
            btnHeader.classList.remove("admin-actif");
        }
    }
}

// Fonction partagée pour la logique admin (point menu + bouton header)
function gererClicAdmin(e) {
    e.stopPropagation();
    if (estAdmin) {
        if (confirm("Quitter le mode administration ?")) {
            estAdmin = false;
            sessionStorage.removeItem("adminUNDR");
            mettreAJourPointAdmin();
            metAJourAffichageAdmin();
            afficherArticles();
        }
    } else {
        const saisie = prompt("Entrez le mot de passe administrateur :");
        if (saisie === MOT_DE_PASSE_ADMIN) {
            estAdmin = true;
            sessionStorage.setItem("adminUNDR", "true");
            alert("✅ Mode administration activé.");
        } else if (saisie !== null) {
            alert("❌ Mot de passe incorrect.");
        }
        mettreAJourPointAdmin();
        metAJourAffichageAdmin();
        afficherArticles();
    }
}

document.getElementById("point-admin").addEventListener("click", function(e) { e.stopPropagation(); gererClicAdmin(e); });
document.getElementById("btn-admin-header").addEventListener("click", function(e) { e.stopPropagation(); gererClicAdmin(e); });

function metAJourAffichageAdmin() {
    const form = document.getElementById("formulaire-ajout");
    if (form) form.style.display = estAdmin ? "block" : "none";
    // Vues : visibles seulement pour admin
    const vues = document.getElementById("detail-vues");
    if (vues) vues.style.display = estAdmin ? "block" : "none";
}

/* ============================================================
   ABONNEMENT — BANDEAU ET STATUT
   ============================================================ */
function mettreAJourBandeauAbo() {
    const bandeau = document.getElementById("bandeau-abonnement");
    if (bandeau) bandeau.style.display = (!estAbonne && !estAdmin) ? "block" : "none";

    const statut = document.getElementById("statut-abonnement-panneau");
    if (!statut) return;
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
            }
        });
    } else {
        statut.innerHTML = `<div class="statut-abo inactif">🔒 Pas d'abonnement actif</div>
            <button class="btn-payer" id="btn-abo-panneau" style="margin-top:8px; width:100%;">S'abonner — 1 000 FCFA/mois</button>`;
        document.getElementById("btn-abo-panneau").addEventListener("click", function () {
            fermerMenuGauche();
            ouvrirModalAbonnement();
        });
    }
}

/* ============================================================
   MENU GAUCHE
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

document.getElementById("menu-btn-adherer").addEventListener("click", function () { fermerMenuGauche(); ouvrirModalAdhesion(); });
document.getElementById("menu-btn-abonner").addEventListener("click", function () { fermerMenuGauche(); ouvrirModalAbonnement(); });
document.getElementById("menu-btn-partager").addEventListener("click", function () {
    fermerMenuGauche();
    partagerLien(window.location.href, "UNDR Actualités");
});

/* ============================================================
   PARTAGE (article ou app)
   ============================================================ */
function partagerLien(url, titre) {
    if (navigator.share) {
        navigator.share({ title: titre, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { alert("Lien copié !"); });
    } else {
        prompt("Copiez ce lien :", url);
    }
}

/* ============================================================
   AFFICHAGE DES ARTICLES
   ============================================================ */
function estPremium(art) {
    return art.premium === true || CATEGORIES_PREMIUM.includes(art.categorie);
}

function afficherArticles() {
    conteneur.innerHTML = "";
    let liste = articles.filter(function (a) {
        return categorieActuelle === "Toutes" || a.categorie === categorieActuelle;
    });

    liste.forEach(function (art, i) {
        const div = document.createElement("div");
        const premium = estPremium(art);
        const verrouille = premium && !estAbonne && !estAdmin;
        div.className = i === 0 ? "article une" : "article";
        if (verrouille) div.classList.add("article-verrou");
        div.dataset.id = art.id;

        const imageSrc = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");
        const overlayVerrou = verrouille ? `<div class="carte-verrou-overlay"><span>🔒</span><small>Abonnez-vous pour lire</small></div>` : "";
        const badgePremium = premium ? `<span class="badge-premium">🔒 Premium</span>` : "";
        const boutonsAdmin = estAdmin ? `<div class="admin-carte-btns">
            <button class="btn-modifier" data-id="${art.id}">✏️ Modifier</button>
            <button class="btn-supprimer" data-id="${art.id}">🗑 Supprimer</button>
        </div>` : "";

        div.innerHTML = `
            <img src="${imageSrc}" class="article-img${verrouille ? " img-floue" : ""}" alt="${art.titre}">
            ${overlayVerrou}
            <span class="badge">${art.categorie}</span>${badgePremium}
            <h2>${art.titre}</h2>
            <p class="date-article">${art.date}</p>
            <button class="btn-partager-carte" data-id="${art.id}">📤</button>
            ${boutonsAdmin}
        `;
        conteneur.appendChild(div);
    });
}

/* ============================================================
   VUES FIREBASE
   ============================================================ */
function incrementerVue(id) {
    if (!window.db) return;
    const ref = window.db.collection("vues").doc(String(id));
    ref.get().then(function (doc) {
        ref.set({ compte: (doc.exists ? doc.data().compte : 0) + 1 });
    });
}
function afficherVue(id) {
    if (!window.db) return;
    window.db.collection("vues").doc(String(id)).onSnapshot(function (doc) {
        const elem = document.getElementById("detail-vues");
        if (elem) {
            const n = doc.exists ? doc.data().compte : 0;
            elem.textContent = "👁 " + n + (n > 1 ? " vues" : " vue") + " (visible admins)";
            elem.style.display = estAdmin ? "block" : "none";
        }
    });
}

/* ============================================================
   LIRE AUSSI
   ============================================================ */
function afficherLireAussi(artActuel) {
    const zone = document.getElementById("lire-aussi");
    if (!zone) return;
    let suggestions = articles.filter(function (a) { return a.id !== artActuel.id; });
    suggestions = suggestions.slice(0, 3);
    if (!suggestions.length) { zone.innerHTML = ""; return; }
    let html = "<h3>Lire aussi</h3><div class='lire-aussi-grille'>";
    suggestions.forEach(function (art) {
        const img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");
        const v = estPremium(art) && !estAbonne && !estAdmin;
        html += `<div class="lire-aussi-carte" data-id="${art.id}">
            <img src="${img}" alt="${art.titre}" ${v ? 'style="filter:blur(3px)"' : ""}>
            <p>${v ? "🔒 " : ""}${art.titre}</p>
        </div>`;
    });
    html += "</div>";
    zone.innerHTML = html;
    zone.querySelectorAll(".lire-aussi-carte").forEach(function (c) {
        c.addEventListener("click", function () { ouvrirArticle(Number(c.dataset.id)); });
    });
}

/* ============================================================
   OUVRIR UN ARTICLE
   ============================================================ */
function ouvrirArticle(id) {
    const art = articles.find(function (a) { return a.id === id; });
    if (!art) return;
    const premium = estPremium(art);
    const verrouille = premium && !estAbonne && !estAdmin;
    const imageSrc = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");

    document.getElementById("detail-img").src = imageSrc;
    document.getElementById("detail-img").style.filter = verrouille ? "blur(6px)" : "none";
    document.getElementById("detail-badge").textContent = art.categorie;
    document.getElementById("detail-titre").textContent = art.titre;
    document.getElementById("detail-date").textContent = art.date;

    // Contenu HTML riche (Times New Roman 12)
    const detailResume = document.getElementById("detail-resume");
    if (verrouille) {
        const texte = art.contenu ? art.contenu.replace(/<[^>]+>/g, "") : "";
        detailResume.innerHTML = `<p style="font-family:'Times New Roman',serif; font-size:12pt; filter:blur(4px); user-select:none;">${texte.substring(0, 100)}...</p>`;
    } else {
        detailResume.innerHTML = `<div style="font-family:'Times New Roman',serif; font-size:12pt; line-height:1.8;">${art.contenu || ""}</div>`;
    }

    // Verrou
    document.getElementById("verrou-premium").style.display = verrouille ? "flex" : "none";

    // Vidéo
    const zoneVideo = document.getElementById("detail-video-zone");
    zoneVideo.innerHTML = "";
    if (!verrouille && art.video) {
        if (art.video.includes("youtube") || art.video.includes("youtu.be")) {
            const vid = art.video.includes("v=") ? art.video.split("v=")[1].split("&")[0] : art.video.split("/").pop();
            zoneVideo.innerHTML = `<iframe class="article-video" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>`;
        } else if (art.video.includes("facebook.com")) {
            const enc = encodeURIComponent(art.video);
            zoneVideo.innerHTML = `<iframe class="article-video" src="https://www.facebook.com/plugins/video.php?href=${enc}&show_text=false" frameborder="0" allowfullscreen></iframe>`;
        }
    }

    // Bouton partager l'article
    const btnPartager = document.getElementById("btn-partager-article");
    btnPartager.onclick = function () {
        partagerLien(window.location.href + "#article-" + id, art.titre);
    };

    // Vues (admin seulement)
    incrementerVue(id);
    afficherVue(id);

    conteneur.style.display = "none";
    document.getElementById("filtres-list").style.display = "none";
    document.getElementById("vue-detail").style.display = "block";
    afficherLireAussi(art);
    window.scrollTo(0, 0);
}

document.getElementById("retour-liste").addEventListener("click", function () {
    document.getElementById("vue-detail").style.display = "none";
    conteneur.style.display = "grid";
    document.getElementById("filtres-list").style.display = "flex";
});

document.getElementById("btn-abo-verrou").addEventListener("click", ouvrirModalAbonnement);
document.getElementById("bandeau-btn-adherer").addEventListener("click", ouvrirModalAdhesion);
document.getElementById("bandeau-btn-abo").addEventListener("click", ouvrirModalAbonnement);

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

/* ============================================================
   CLIC SUR LES CARTES
   ============================================================ */
conteneur.addEventListener("click", function (e) {
    // Bouton partager carte
    if (e.target.classList.contains("btn-partager-carte")) {
        const id = Number(e.target.dataset.id);
        const art = articles.find(function (a) { return a.id === id; });
        if (art) partagerLien(window.location.href + "#article-" + id, art.titre);
        return;
    }
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
        document.getElementById("nouveau-titre").value = art.titre;
        document.getElementById("nouvelle-categorie").value = art.categorie;
        document.getElementById("editeur-contenu").innerHTML = art.contenu || "";
        document.getElementById("nouvelle-video").value = art.video || "";
        document.getElementById("article-premium").checked = art.premium === true;
        modeEdition = true; idEdition = id;
        document.getElementById("bouton-publier").textContent = "Enregistrer";
        document.getElementById("formulaire-ajout").scrollIntoView({ behavior: "smooth" });
        return;
    }
    // Ouvrir article
    const carte = e.target.closest(".article");
    if (carte) {
        const id = Number(carte.dataset.id);
        const art = articles.find(function (a) { return a.id === id; });
        if (art && estPremium(art) && !estAbonne && !estAdmin) {
            ouvrirModalAbonnement(); return;
        }
        ouvrirArticle(id);
    }
});

/* ============================================================
   PUBLIER / MODIFIER UN ARTICLE
   ============================================================ */
document.getElementById("bouton-publier").addEventListener("click", function () {
    const titre = document.getElementById("nouveau-titre").value.trim();
    const contenu = document.getElementById("editeur-contenu").innerHTML.trim();
    if (!titre || !contenu) { alert("Merci de remplir le titre et le contenu."); return; }

    function sauver(imageData) {
        if (modeEdition && idEdition !== null) {
            const idx = articles.findIndex(function (a) { return a.id === idEdition; });
            if (idx !== -1) {
                articles[idx].titre = titre;
                articles[idx].contenu = contenu;
                articles[idx].categorie = document.getElementById("nouvelle-categorie").value;
                articles[idx].video = document.getElementById("nouvelle-video").value.trim();
                articles[idx].premium = document.getElementById("article-premium").checked;
                if (imageData) articles[idx].image = imageData;
            }
            modeEdition = false; idEdition = null;
            document.getElementById("bouton-publier").textContent = "Publier";
        } else {
            articles.unshift({
                id: Date.now(),
                titre: titre,
                date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
                contenu: contenu,
                categorie: document.getElementById("nouvelle-categorie").value,
                image: imageData || "",
                video: document.getElementById("nouvelle-video").value.trim(),
                premium: document.getElementById("article-premium").checked
            });
        }
        localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        document.getElementById("nouveau-titre").value = "";
        document.getElementById("editeur-contenu").innerHTML = "";
        document.getElementById("nouvelle-video").value = "";
        document.getElementById("nouvelle-image").value = "";
        document.getElementById("article-premium").checked = false;
        afficherArticles();
    }

    const fichierImage = document.getElementById("nouvelle-image").files[0];
    if (fichierImage) {
        const reader = new FileReader();
        reader.onload = function (e) { sauver(e.target.result); };
        reader.readAsDataURL(fichierImage);
    } else { sauver(null); }
});

/* ============================================================
   LANGUE
   ============================================================ */
let langueActuelle = localStorage.getItem("langueUNDR") || "fr";
function appliquerLangue(lang) {
    langueActuelle = lang;
    localStorage.setItem("langueUNDR", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}
document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { appliquerLangue(btn.dataset.lang); });
});

/* ============================================================
   MODE SOMBRE
   ============================================================ */
const toggleSombre = document.getElementById("toggle-sombre");
if (localStorage.getItem("modeSombreUNDR") === "true") {
    document.body.classList.add("mode-sombre");
    toggleSombre.checked = true;
}
toggleSombre.addEventListener("change", function () {
    document.body.classList.toggle("mode-sombre", toggleSombre.checked);
    localStorage.setItem("modeSombreUNDR", toggleSombre.checked);
});

/* ============================================================
   TAILLE DU TEXTE
   ============================================================ */
function appliquerTaille(niveau) {
    const t = { petit: "14px", normal: "16px", grand: "19px" };
    document.body.style.fontSize = t[niveau] || "16px";
    localStorage.setItem("tailleTexteUNDR", niveau);
}
document.querySelectorAll(".taille-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { appliquerTaille(btn.dataset.taille); });
});
appliquerTaille(localStorage.getItem("tailleTexteUNDR") || "normal");

/* ============================================================
   MODAL ADHÉSION
   ============================================================ */
function ouvrirModalAdhesion() {
    ["adh-nom","adh-tel","adh-region","adh-organe","adh-poste"].forEach(function (id) {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    const naiss = document.getElementById("adh-naissance"); if (naiss) naiss.value = "";
    document.getElementById("apercu-photo").innerHTML = "";
    const acc = document.getElementById("adh-accord"); if (acc) acc.checked = false;
    document.getElementById("etape-adhesion-1").style.display = "block";
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-3").style.display = "none";
    document.getElementById("modal-adhesion").style.display = "flex";
}
function fermerModalAdhesion() {
    document.getElementById("modal-adhesion").style.display = "none";
}

document.getElementById("fermer-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("fermer-succes-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("modal-adhesion").addEventListener("click", function (e) {
    if (e.target === this) fermerModalAdhesion();
});

// Aperçu photo
document.getElementById("adh-photo").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo trop lourde (max 2 Mo)."); this.value = ""; return; }
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("apercu-photo").innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:110px; border-radius:6px; margin-top:6px;">`;
    };
    reader.readAsDataURL(file);
});

// Étape 1 → 2
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
    const organe = document.getElementById("adh-organe").value.trim();
    const poste = document.getElementById("adh-poste").value.trim();
    document.getElementById("recapitulatif-adhesion").innerHTML = `
        <div class="recap-ligne"><span>Nom :</span><strong>${nom}</strong></div>
        <div class="recap-ligne"><span>Naissance :</span><strong>${naissance}</strong></div>
        <div class="recap-ligne"><span>Téléphone :</span><strong>${tel}</strong></div>
        <div class="recap-ligne"><span>Région :</span><strong>${region}</strong></div>
        ${organe ? `<div class="recap-ligne"><span>Organe :</span><strong>${organe}</strong></div>` : ""}
        ${poste ? `<div class="recap-ligne"><span>Poste :</span><strong>${poste}</strong></div>` : ""}
        <div class="recap-ligne"><span>Photo :</span><strong>✅ Jointe</strong></div>
    `;
    document.getElementById("etape-adhesion-1").style.display = "none";
    document.getElementById("etape-adhesion-2").style.display = "block";
});

document.getElementById("btn-retour-adhesion").addEventListener("click", function () {
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-1").style.display = "block";
});

document.getElementById("btn-soumettre-adhesion").addEventListener("click", function () {
    if (!document.getElementById("adh-accord").checked) {
        alert("Vous devez accepter la charte de l'UNDR.");
        return;
    }
    const num = "UNDR-" + Date.now().toString().slice(-6);
    const demande = {
        id: num,
        nom: document.getElementById("adh-nom").value.trim(),
        naissance: document.getElementById("adh-naissance").value,
        tel: document.getElementById("adh-tel").value.trim(),
        region: document.getElementById("adh-region").value.trim(),
        organe: document.getElementById("adh-organe").value.trim(),
        poste: document.getElementById("adh-poste").value.trim(),
        date: new Date().toLocaleDateString("fr-FR"),
        statut: "En attente"
    };
    const demandes = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];
    demandes.push(demande);
    localStorage.setItem("adhesionsUNDR", JSON.stringify(demandes));
    if (window.db) {
        window.db.collection("adhesions").add({ ...demande, date: firebase.firestore.FieldValue.serverTimestamp() });
    }
    document.getElementById("num-dossier").textContent = num;
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-3").style.display = "block";
});

/* ============================================================
   MODAL ABONNEMENT — PAIEMENT MOBILE MONEY
   ============================================================ */
function ouvrirModalAbonnement() {
    document.getElementById("etape-paiement-1").style.display = "block";
    document.getElementById("etape-paiement-2").style.display = "none";
    document.getElementById("etape-paiement-3").style.display = "none";
    ["abo-nom","abo-tel","code-confirmation"].forEach(function (id) {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    document.getElementById("abo-operateur").value = "";
    document.getElementById("modal-abonnement").style.display = "flex";
}
function fermerModalAbonnement() {
    document.getElementById("modal-abonnement").style.display = "none";
}

document.getElementById("fermer-abonnement").addEventListener("click", fermerModalAbonnement);
document.getElementById("modal-abonnement").addEventListener("click", function (e) {
    if (e.target === this) fermerModalAbonnement();
});
document.getElementById("fermer-succes-abo").addEventListener("click", function () {
    fermerModalAbonnement();
    mettreAJourBandeauAbo();
    afficherArticles();
});

// Étape 1 → instructions paiement
document.getElementById("btn-payer").addEventListener("click", function () {
    const nom = document.getElementById("abo-nom").value.trim();
    const tel = document.getElementById("abo-tel").value.trim();
    const operateur = document.getElementById("abo-operateur").value;
    if (!nom || !tel || !operateur) { alert("Merci de remplir tous les champs."); return; }

    // Référence unique pour identifier le paiement
    const ref = operateur.replace(" ","").toUpperCase().slice(0,3) + "-" + Date.now().toString().slice(-6);
    document.getElementById("ref-paiement").textContent = ref;

    // Instructions selon l'opérateur
    const zoneInstr = document.getElementById("instructions-operateur");
    if (zoneInstr) {
        if (operateur === "Airtel Money") {
            zoneInstr.innerHTML = `<p>📱 Composez <strong>*555#</strong> → Envoyer argent → Entrez le numéro <strong>66 79 77 51</strong> → Montant : <strong>1000</strong> → Référence : <strong>${ref}</strong></p>`;
        } else {
            zoneInstr.innerHTML = `<p>📱 Composez <strong>*606#</strong> → Transfert → Entrez le numéro <strong>66 79 77 51</strong> → Montant : <strong>1000</strong> → Référence : <strong>${ref}</strong></p>`;
        }
    }

    document.getElementById("etape-paiement-1").style.display = "none";
    document.getElementById("etape-paiement-2").style.display = "block";
});

// Valider le code de confirmation
document.getElementById("btn-valider-paiement").addEventListener("click", function () {
    const code = document.getElementById("code-confirmation").value.trim();
    if (!code) { alert("Entrez le code de transaction reçu par SMS."); return; }

    const nom = document.getElementById("abo-nom").value.trim();
    const tel = document.getElementById("abo-tel").value.trim();
    const operateur = document.getElementById("abo-operateur").value;
    const ref = document.getElementById("ref-paiement").textContent;

    const entree = { nom, tel, operateur, ref, code, date: new Date().toLocaleDateString("fr-FR"), statut: "En attente" };
    const abonnes = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
    abonnes.push(entree);
    localStorage.setItem("abonnesUNDR", JSON.stringify(abonnes));

    if (window.db) {
        window.db.collection("abonnements").add({ ...entree, date: firebase.firestore.FieldValue.serverTimestamp() });
    }

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
    if (!demandes.length) { zone.innerHTML = "<p style='color:#888; font-size:13px;'>Aucune demande.</p>"; return; }
    zone.innerHTML = demandes.map(function (d, i) {
        return `<div class="adhesion-item">
            <strong>${d.nom}</strong> — ${d.region} — 📞 ${d.tel}<br>
            ${d.organe ? "<small>Organe : " + d.organe + " | Poste : " + (d.poste||"—") + "</small><br>" : ""}
            <small>Né le ${d.naissance} | Dossier : ${d.id} | ${d.date}</small><br>
            <span class="badge-statut ${d.statut==="Validé"?"valide":"attente"}">${d.statut}</span>
            ${d.statut!=="Validé"?`<button class="btn-valider-adhesion" data-index="${i}">✅ Valider</button>`:""}
            <button class="btn-suppr-adhesion" data-index="${i}">🗑</button>
        </div>`;
    }).join("");
    zone.querySelectorAll(".btn-valider-adhesion").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const d = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];
            d[Number(btn.dataset.index)].statut = "Validé";
            localStorage.setItem("adhesionsUNDR", JSON.stringify(d));
            chargerAdhesionsAdmin();
        });
    });
    zone.querySelectorAll(".btn-suppr-adhesion").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const d = JSON.parse(localStorage.getItem("adhesionsUNDR")) || [];
            d.splice(Number(btn.dataset.index), 1);
            localStorage.setItem("adhesionsUNDR", JSON.stringify(d));
            chargerAdhesionsAdmin();
        });
    });
}

function chargerAbonnesAdmin() {
    const zone = document.getElementById("liste-abonnes");
    if (!zone) return;
    const abonnes = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
    if (!abonnes.length) { zone.innerHTML = "<p style='color:#888; font-size:13px;'>Aucun abonné.</p>"; return; }
    zone.innerHTML = abonnes.map(function (a, i) {
        return `<div class="adhesion-item">
            <strong>${a.nom}</strong> — ${a.operateur} — 📞 ${a.tel}<br>
            <small>Réf : ${a.ref} | Code : ${a.code} | ${a.date}</small><br>
            <span class="badge-statut ${a.statut==="Validé"?"valide":"attente"}">${a.statut}</span>
            ${a.statut!=="Validé"?`<button class="btn-activer-abo" data-index="${i}">✅ Activer</button>`:""}
            <button class="btn-suppr-abo" data-index="${i}">🗑</button>
        </div>`;
    }).join("");
    zone.querySelectorAll(".btn-activer-abo").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ab = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
            ab[Number(btn.dataset.index)].statut = "Validé";
            localStorage.setItem("abonnesUNDR", JSON.stringify(ab));
            chargerAbonnesAdmin();
        });
    });
    zone.querySelectorAll(".btn-suppr-abo").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const ab = JSON.parse(localStorage.getItem("abonnesUNDR")) || [];
            ab.splice(Number(btn.dataset.index), 1);
            localStorage.setItem("abonnesUNDR", JSON.stringify(ab));
            chargerAbonnesAdmin();
        });
    });
}

function metAJourAffichageAdminComplet() {
    metAJourAffichageAdmin();
    if (estAdmin) { chargerAdhesionsAdmin(); chargerAbonnesAdmin(); chargerPubsAdmin(); }
}

/* ============================================================
   PUBLICITÉS MAISON
   ============================================================ */
function chargerPubsAdmin() {
    const ph = JSON.parse(localStorage.getItem("pubHautUNDR") || "null");
    const pb = JSON.parse(localStorage.getItem("pubBasUNDR") || "null");
    if (ph) { document.getElementById("pub-haut-titre").value = ph.titre || ""; document.getElementById("pub-haut-lien").value = ph.lien || ""; }
    if (pb) { document.getElementById("pub-bas-titre").value = pb.titre || ""; document.getElementById("pub-bas-lien").value = pb.lien || ""; }
}
function afficherPubMaison(zone, data) {
    if (!data || !data.image) { zone.style.display = "none"; return; }
    zone.style.display = "block";
    zone.innerHTML = `<a href="${data.lien||"#"}" target="_blank" class="pub-maison-lien">
        <img src="${data.image}" alt="${data.titre||"Pub"}" class="pub-maison-img">
        <span class="pub-label">Publicité</span>
    </a>`;
}
function rafraichirPubs() {
    afficherPubMaison(document.getElementById("pub-maison-haut"), JSON.parse(localStorage.getItem("pubHautUNDR")||"null"));
    afficherPubMaison(document.getElementById("pub-maison-bas"), JSON.parse(localStorage.getItem("pubBasUNDR")||"null"));
}
function enregistrerPub(cle, titreId, lienId, imageId) {
    const titre = document.getElementById(titreId).value.trim();
    const lien = document.getElementById(lienId).value.trim();
    const fichier = document.getElementById(imageId).files[0];
    function sauver(img) {
        localStorage.setItem(cle, JSON.stringify({ titre, lien, image: img }));
        rafraichirPubs(); alert("Publicité enregistrée !");
    }
    if (fichier) { const r = new FileReader(); r.onload = function (e) { sauver(e.target.result); }; r.readAsDataURL(fichier); }
    else { const ex = JSON.parse(localStorage.getItem(cle)||"null"); sauver(ex ? ex.image : ""); }
}
document.getElementById("btn-sauver-pub-haut").addEventListener("click", function () { enregistrerPub("pubHautUNDR","pub-haut-titre","pub-haut-lien","pub-haut-image"); });
document.getElementById("btn-sauver-pub-bas").addEventListener("click", function () { enregistrerPub("pubBasUNDR","pub-bas-titre","pub-bas-lien","pub-bas-image"); });

/* ============================================================
   DIRECT FACEBOOK
   ============================================================ */
document.getElementById("toggle-direct").addEventListener("click", function () {
    const zone = document.getElementById("zone-direct");
    const ouvert = zone.style.display !== "none";
    zone.style.display = ouvert ? "none" : "block";
    this.textContent = ouvert ? "🔴 Suivre le Direct" : "✖ Fermer le Direct";
});

/* ============================================================
   INITIALISATION
   ============================================================ */
appliquerLangue(langueActuelle);
mettreAJourBandeauAbo();
mettreAJourPointAdmin();
metAJourAffichageAdminComplet();
rafraichirPubs();
afficherArticles();

if ("serviceWorker" in navigator) { navigator.serviceWorker.register("service-worker.js"); }

}); // fin DOMContentLoaded

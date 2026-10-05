/* UNDR Actualites - script.js - Version finale corrigee */

/* Desinscrire tous les anciens service workers et vider les caches */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(regs) {
        regs.forEach(function(r) { r.unregister(); });
    });
    caches.keys().then(function(keys) {
        keys.forEach(function(k) { caches.delete(k); });
    });
}



const MOT_DE_PASSE_ADMIN = "undr2026";
let estAdmin = sessionStorage.getItem("adminUNDR") === "true";
let estAbonne = localStorage.getItem("abonneUNDR") === "true";
const CATEGORIES_PREMIUM = ["Actualités","Communiqués","Actualités Tchad","Actualités Politique","Divertissement"];

/* ================================================================
   FIREBASE — nécessaire aux vues, likes et prochains événements
   ================================================================ */
if (typeof firebase !== "undefined") {
    var firebaseConfig = {
        apiKey: "AIzaSyBHqV5kBxzDn3RRGOq0fXkhByiCPcovKPE",
        authDomain: "undr-actu-c3c93.firebaseapp.com",
        projectId: "undr-actu-c3c93",
        storageBucket: "undr-actu-c3c93.firebasestorage.app",
        messagingSenderId: "876878050929",
        appId: "1:876878050929:web:fbed51a7fd3e375ce3cdd0"
    };
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
}

/* ---- ACCORDÉONS MENU (fonction globale appelée depuis HTML) ---- */
function toggleAcc(id, btn) {
    var el = document.getElementById(id);
    var icone = btn.querySelector(".acc-icone");
    if (el.style.display === "none") {
        el.style.display = "block";
        icone.textContent = "▴";
    } else {
        el.style.display = "none";
        icone.textContent = "▾";
    }
}

/* ---- ARTICLES PAR DÉFAUT ---- */
var articlesParDefaut = [
    {id:1,titre:"Session parlementaire ouverte",date:"20 juillet 2026",contenu:"Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.",categorie:"Actualités",image:"",video:"",videoFichier:"",premium:true,importance:3},
    {id:2,titre:"Visite de terrain dans la région Nord",date:"15 juillet 2026",contenu:"Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.",categorie:"Activités",image:"",video:"",videoFichier:"",premium:false,importance:2},
    {id:3,titre:"Déclaration officielle du groupe",date:"10 juillet 2026",contenu:"Le groupe a publié une déclaration concernant les récents débats budgétaires.",categorie:"Communiqués",image:"",video:"",videoFichier:"",premium:true,importance:1}
];

var articles = JSON.parse(localStorage.getItem("articlesUNDR") || "null") || articlesParDefaut;
var categorieActuelle = "Toutes";
var modeEdition = false;
var idEdition = null;
var videoFichierData = null;
var derniereDemande = null;

var conteneur = document.getElementById("liste-articles");
var boutonsFiltre = document.querySelectorAll(".filtre-btn");

function estPremium(art) { return art.premium === true || CATEGORIES_PREMIUM.includes(art.categorie); }

/* ================================================================
   1. NOTIFICATIONS
   ================================================================ */
function demanderNotifications() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    if (localStorage.getItem("notifRefuseeUNDR") === "true") return;
    var b = document.getElementById("banniere-notif");
    if (b) b.style.display = "flex";
}
function activerNotifications() {
    var b = document.getElementById("banniere-notif");
    if (b) b.style.display = "none";
    Notification.requestPermission().then(function(perm) {
        if (perm === "granted") alert("✅ Notifications activées !");
    });
}
function envoyerNotifLocale(titre) {
    if (Notification.permission === "granted") {
        new Notification("📰 UNDR Actualités — Nouvelle publication", {
            body: titre,
            icon: "./logo.png",
            badge: "./logo.png",
            tag: "undr-nouvel-article"
        });
    }
}

/* Toast de notification visuelle (comme une pub qui apparaît) */
function afficherToast(message) {
    /* Supprimer un toast existant */
    var ancien = document.getElementById("toast-undr");
    if (ancien) ancien.remove();

    var toast = document.createElement("div");
    toast.id = "toast-undr";
    toast.className = "toast-notif";
    toast.textContent = message;
    document.body.appendChild(toast);

    /* Afficher avec animation */
    setTimeout(function() { toast.classList.add("toast-visible"); }, 50);
    /* Disparaître après 3 secondes */
    setTimeout(function() {
        toast.classList.remove("toast-visible");
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
    }, 3500);
}

/* ================================================================
   ADMIN — POINT ORANGE SECRET
   ================================================================ */
function mettreAJourPointAdmin() {
    var p = document.getElementById("point-admin");
    if (p) p.style.color = estAdmin ? "#e63946" : "#e67e22";
}

document.getElementById("point-admin").addEventListener("click", function(e) {
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
        var s = prompt("Mot de passe administrateur :");
        if (s === MOT_DE_PASSE_ADMIN) {
            estAdmin = true;
            sessionStorage.setItem("adminUNDR", "true");
            alert("✅ Mode admin activé.");
        } else if (s !== null) {
            alert("❌ Mot de passe incorrect.");
        }
        mettreAJourPointAdmin();
        metAJourAffichageAdmin();
        afficherArticles();
    }
});

function metAJourAffichageAdmin() {
    var f = document.getElementById("formulaire-ajout");
    if (f) f.style.display = estAdmin ? "block" : "none";
    if (estAdmin) { chargerAdhesionsAdmin(); chargerPubsAdmin(); afficherListeEvenementsAdmin(); }
    /* Les vues sont gérées par afficherVue() — visible par tous */
    var btnPart = document.getElementById("btn-partager-article");
    if (btnPart) btnPart.style.display = estAdmin ? "inline-flex" : "none";
}

/* ================================================================
   2. EN-TÊTE FIXE
   ================================================================ */
function ajusterEspaceEntete() {
    var entete = document.getElementById("entete-fixe");
    var espace = document.getElementById("espace-entete");
    if (entete && espace) espace.style.height = entete.offsetHeight + "px";
}
window.addEventListener("resize", ajusterEspaceEntete);

/* ================================================================
   MENU GAUCHE
   ================================================================ */
function ouvrirMenuGauche() {
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
document.getElementById("menu-btn-adherer").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalAdhesion(); });
document.getElementById("menu-btn-cotisations").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalCotisations(); });
document.getElementById("menu-btn-don").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalDon(); });
document.getElementById("menu-btn-partager").addEventListener("click", function() { fermerMenuGauche(); partagerFacebook(window.location.href); });

/* ================================================================
   PAGE D'ACCUEIL (SPLASH)
   ================================================================ */
(function() {
    var diapos = document.querySelectorAll("#accueil-diaporama .diapo-image");
    if (!diapos.length) return;
    var index = 0;
    setInterval(function() {
        diapos[index].classList.remove("diapo-active");
        index = (index + 1) % diapos.length;
        diapos[index].classList.add("diapo-active");
    }, 5000);
})();

function fermerPageAccueil(callback) {
    var pa = document.getElementById("page-accueil");
    var ac = document.getElementById("app-contenu");
    if (pa) pa.classList.add("page-accueil-sortie");
    setTimeout(function() {
        if (pa) pa.style.display = "none";
        if (ac) {
            ac.style.display = "block";
            requestAnimationFrame(function() { ac.classList.add("app-contenu-visible"); });
        }
        ajusterEspaceEntete();
        if (typeof callback === "function") callback();
    }, 380);
}
var btnAccueilAccueil = document.getElementById("accueil-btn-accueil");
if (btnAccueilAccueil) btnAccueilAccueil.addEventListener("click", function() { fermerPageAccueil(); });

var btnAccueilAdherer = document.getElementById("accueil-btn-adherer");
if (btnAccueilAdherer) btnAccueilAdherer.addEventListener("click", function() {
    fermerPageAccueil(function() { ouvrirModalAdhesion(); });
});

var btnAccueilActus = document.getElementById("accueil-btn-actualites");
if (btnAccueilActus) btnAccueilActus.addEventListener("click", function() {
    fermerPageAccueil(function() {
        var btnFiltreActus = document.querySelector('.filtre-btn[data-categorie="Actualités"]');
        if (btnFiltreActus) btnFiltreActus.click();
    });
});

var btnAccueilContact = document.getElementById("accueil-btn-contact");
if (btnAccueilContact) btnAccueilContact.addEventListener("click", function() {
    fermerPageAccueil(function() {
        setTimeout(function() {
            var pied = document.querySelector(".pied-de-page");
            if (pied) pied.scrollIntoView({ behavior: "smooth" });
        }, 150);
    });
});

/* ================================================================
   5. PARTAGE FACEBOOK DIRECT
   ================================================================ */
function partagerFacebook(url) {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank", "width=600,height=400,noopener");
}

/* ================================================================
   2. AFFICHAGE ARTICLES — TRI "À LA UNE"
   ================================================================ */
function trierALaUne(liste) {
    return liste.slice().sort(function(a, b) {
        return (b.importance || 0) - (a.importance || 0) || b.id - a.id;
    });
}

function genererExtrait(contenuHtml) {
    var texte = (contenuHtml || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (texte.length > 160) texte = texte.substring(0, 160).trim() + "…";
    return texte;
}

var articlesTousAffiches = false;
function afficherArticles() {
    conteneur.innerHTML = "";
    var liste = categorieActuelle === "Toutes"
        ? trierALaUne(articles)
        : articles.filter(function(a) { return a.categorie === categorieActuelle; });

    var listeComplete = liste;
    var masques = 0;
    if (!articlesTousAffiches && liste.length > 3) {
        masques = liste.length - 3;
        liste = liste.slice(0, 3);
    }

    liste.forEach(function(art, i) {
        var div = document.createElement("div");
        var premium = estPremiumEffectif(art);
        var verr = premium && !estAbonne && !estAdmin;
        div.className = i === 0 ? "article une" : "article";
        if (verr) div.classList.add("article-verrou");
        div.dataset.id = art.id;
        var img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");

        /* 1. Badge "À la Une" et bouton 📘 Facebook : admin seulement */
        var badgeUne = (i === 0 && estAdmin) ? "<span class='badge-une'>⭐ À la Une</span>" : "";
        var btnPartager = estAdmin ? "<button class='btn-partager-carte' data-id='" + art.id + "' title='Partager sur Facebook'>📘</button>" : "";
        var boutonsAdmin = estAdmin
            ? "<div class='admin-carte-btns'>" +
              "<button class='btn-modifier' data-id='" + art.id + "'>✏️ Modifier</button>" +
              "<button class='btn-supprimer' data-id='" + art.id + "'>🗑 Supprimer</button>" +
              "<select class='select-importance' data-id='" + art.id + "' title='Importance'>" +
              "<option value='0' " + (!art.importance ? "selected" : "") + ">Normale</option>" +
              "<option value='1' " + (art.importance===1 ? "selected" : "") + ">⭐ Importante</option>" +
              "<option value='2' " + (art.importance===2 ? "selected" : "") + ">⭐⭐ Très importante</option>" +
              "<option value='3' " + (art.importance===3 ? "selected" : "") + ">⭐⭐⭐ À la une</option>" +
              "</select></div>"
            : "";

        div.innerHTML =
            "<div class='article-img-zone'>" +
                "<img src='" + img + "' class='article-img" + (verr ? " img-floue" : "") + "' alt='" + art.titre + "'>" +
                (verr ? "<div class='carte-verrou-overlay'><span>🔒</span><small>Abonnez-vous</small></div>" : "") +
                btnPartager +
            "</div>" +
            "<div class='article-corps'>" +
                "<span class='badge'>" + art.categorie + "</span>" +
                (premium ? "<span class='badge-premium'>🔒 Premium</span>" : "") +
                badgeUne +
                "<h2>" + art.titre + "</h2>" +
                "<p class='extrait-article'>" + genererExtrait(art.contenu) + "</p>" +
                "<button class='btn-lire-suite' data-id='" + art.id + "'>Lire la suite →</button>" +
                "<p class='date-article'>" + art.date + "</p>" +
            "</div>" +
            boutonsAdmin;

        conteneur.appendChild(div);
    });

    /* Bouton "Voir plus" / "Voir moins" */
    var ancienBtn = document.getElementById("btn-voir-plus-articles");
    if (ancienBtn) ancienBtn.remove();
    if (listeComplete.length > 3) {
        var btnVoirPlus = document.createElement("button");
        btnVoirPlus.id = "btn-voir-plus-articles";
        btnVoirPlus.className = "btn-voir-plus";
        btnVoirPlus.textContent = articlesTousAffiches
            ? "▲ Voir moins"
            : "Voir plus (" + masques + ") ▼";
        btnVoirPlus.addEventListener("click", function() {
            articlesTousAffiches = !articlesTousAffiches;
            afficherArticles();
            if (!articlesTousAffiches) conteneur.scrollIntoView({ behavior: "smooth" });
        });
        conteneur.insertAdjacentElement("afterend", btnVoirPlus);
    }

    /* Bouton "Lire la suite" : ouvre l'article sans déclencher le clic de la carte */
    conteneur.querySelectorAll(".btn-lire-suite").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
            ouvrirArticle(Number(btn.dataset.id));
        });
    });

    /* Gérer le sélecteur d'importance admin */
    conteneur.querySelectorAll(".select-importance").forEach(function(sel) {
        sel.addEventListener("change", function() {
            var id = Number(sel.dataset.id);
            var idx = articles.findIndex(function(a) { return a.id === id; });
            if (idx !== -1) {
                articles[idx].importance = Number(sel.value);
                localStorage.setItem("articlesUNDR", JSON.stringify(articles));
                afficherArticles();
            }
        });
    });
}

/* ================================================================
   6. VUES FIREBASE
   ================================================================ */
function incrementerVue(id) {
    if (!window.db) return;
    window.db.collection("vues").doc(String(id)).get().then(function(doc) {
        window.db.collection("vues").doc(String(id)).set({ compte: (doc.exists ? doc.data().compte : 0) + 1 });
    }).catch(function(){});
}
function afficherVue(id) {
    var el = document.getElementById("detail-vues");
    if (!el) return;
    el.style.display = "block"; /* visible par tous */
    if (!window.db) {
        /* Afficher depuis le cache local en attendant Firebase */
        var cached = localStorage.getItem("vues_" + id);
        if (cached) {
            var n = Number(cached);
            el.textContent = "👁 " + n + (n > 1 ? " vues" : " vue");
        }
        return;
    }
    window.db.collection("vues").doc(String(id)).onSnapshot(function(doc) {
        var n = doc.exists ? doc.data().compte : 0;
        localStorage.setItem("vues_" + id, n);
        el.textContent = "👁 " + n + (n > 1 ? " vues" : " vue");
        el.style.display = "block";
    }, function() {
        var cached = localStorage.getItem("vues_" + id);
        if (cached) el.textContent = "👁 " + cached + " vue(s)";
    });
}

/* ================================================================
   6bis. J'AIME (LIKES) FIREBASE
   ================================================================ */
function afficherLikes(id) {
    var btn = document.getElementById("btn-jaime");
    var compteEl = document.getElementById("jaime-compte");
    if (!btn || !compteEl) return;

    var dejaAime = localStorage.getItem("aime_" + id) === "true";
    btn.classList.toggle("aime", dejaAime);

    function majAffichage(n) {
        compteEl.textContent = n;
        localStorage.setItem("jaime_compte_" + id, n);
    }
    var cache = localStorage.getItem("jaime_compte_" + id);
    if (cache) majAffichage(Number(cache));

    if (window.db) {
        window.db.collection("likes").doc(String(id)).onSnapshot(function(doc) {
            majAffichage(doc.exists ? (doc.data().compte || 0) : 0);
        }, function() {});
    }

    btn.onclick = function() {
        var aime = localStorage.getItem("aime_" + id) === "true";
        var variation = aime ? -1 : 1;
        localStorage.setItem("aime_" + id, aime ? "false" : "true");
        btn.classList.toggle("aime", !aime);

        var compteActuel = Number(localStorage.getItem("jaime_compte_" + id) || "0");
        majAffichage(Math.max(0, compteActuel + variation));

        if (window.db) {
            window.db.collection("likes").doc(String(id)).get().then(function(doc) {
                var base = doc.exists ? (doc.data().compte || 0) : 0;
                window.db.collection("likes").doc(String(id)).set({ compte: Math.max(0, base + variation) });
            }).catch(function(){});
        }
    };
}

/* ================================================================
   LIRE AUSSI
   ================================================================ */
function afficherLireAussi(artActuel) {
    var zone = document.getElementById("lire-aussi");
    if (!zone) return;
    var sugg = articles.filter(function(a) { return a.id !== artActuel.id; }).slice(0, 3);
    if (!sugg.length) { zone.innerHTML = ""; return; }
    var html = "<h3>Lire aussi</h3><div class='lire-aussi-grille'>";
    sugg.forEach(function(art) {
        var img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");
        var v = estPremiumEffectif(art) && !estAbonne && !estAdmin;
        html += "<div class='lire-aussi-carte' data-id='" + art.id + "'>" +
                "<img src='" + img + "' " + (v ? "style='filter:blur(3px)'" : "") + " alt=''>" +
                "<p>" + (v ? "🔒 " : "") + art.titre + "</p></div>";
    });
    html += "</div>";
    zone.innerHTML = html;
    zone.querySelectorAll(".lire-aussi-carte").forEach(function(c) {
        c.addEventListener("click", function() { ouvrirArticle(Number(c.dataset.id)); });
    });
}

/* ================================================================
   OUVRIR UN ARTICLE
   ================================================================ */
function ouvrirArticle(id) {
    var art = articles.find(function(a) { return a.id === id; });
    if (!art) return;
    var premium = estPremiumEffectif(art);
    var verr = premium && !estAbonne && !estAdmin;
    var img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");

    document.getElementById("detail-img").src = img;
    document.getElementById("detail-img").style.filter = verr ? "blur(6px)" : "none";
    document.getElementById("detail-badge").textContent = art.categorie;
    document.getElementById("detail-titre").textContent = art.titre;
    document.getElementById("detail-date").textContent = art.date;

    var dr = document.getElementById("detail-resume");
    if (verr) {
        var txt = (art.contenu || "").replace(/<[^>]+>/g, "");
        dr.innerHTML = "<p style='font-family:Times New Roman,serif;font-size:12pt;filter:blur(4px);user-select:none;'>" + txt.substring(0, 120) + "...</p>";
    } else {
        dr.innerHTML = "<div style='font-family:Times New Roman,serif;font-size:12pt;line-height:1.8;'>" + (art.contenu || "") + "</div>";
    }

    var zv = document.getElementById("detail-video-zone");
    zv.innerHTML = "";
    if (!verr) {
        if (art.videoFichier) {
            zv.innerHTML = "<video class='article-video' src='" + art.videoFichier + "' controls playsinline style='width:100%;border-radius:8px;'></video>";
        } else if (art.video) {
            if (art.video.includes("youtube") || art.video.includes("youtu.be")) {
                var vid = art.video.includes("v=") ? art.video.split("v=")[1].split("&")[0] : art.video.split("/").pop();
                zv.innerHTML = "<iframe class='article-video' src='https://www.youtube.com/embed/" + vid + "' frameborder='0' allowfullscreen></iframe>";
            } else if (art.video.includes("facebook.com")) {
                zv.innerHTML = "<iframe class='article-video' src='https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(art.video) + "&show_text=false' frameborder='0' allowfullscreen></iframe>";
            }
        }
    }

    /* 1. Bouton partager Facebook : admin seulement */
    var btnPart = document.getElementById("btn-partager-article");
    btnPart.style.display = estAdmin ? "inline-flex" : "none";
    btnPart.onclick = function() { partagerFacebook(window.location.href.split("#")[0] + "#article-" + id); };

    /* 6. Vues */
    incrementerVue(id);
    afficherVue(id);
    afficherLikes(id);

    conteneur.style.display = "none";
    document.getElementById("filtres-list").style.display = "none";
    document.getElementById("vue-detail").style.display = "block";
    afficherLireAussi(art);
    window.scrollTo(0, 0);
}

document.getElementById("retour-liste").addEventListener("click", function() {
    document.getElementById("vue-detail").style.display = "none";
    conteneur.style.display = "grid";
    document.getElementById("filtres-list").style.display = "flex";
});
/* FILTRES */
boutonsFiltre.forEach(function(b) {
    b.addEventListener("click", function() {
        boutonsFiltre.forEach(function(x) { x.classList.remove("actif"); });
        b.classList.add("actif");
        categorieActuelle = b.dataset.categorie;
        articlesTousAffiches = false;
        afficherArticles();
    });
});

/* CLIC SUR LES CARTES */
conteneur.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-partager-carte")) {
        var id = Number(e.target.dataset.id);
        var art = articles.find(function(a) { return a.id === id; });
        if (art) partagerFacebook(window.location.href.split("#")[0] + "#article-" + id);
        return;
    }
    if (e.target.classList.contains("btn-supprimer")) {
        var id = Number(e.target.dataset.id);
        if (confirm("Supprimer cet article ?")) {
            articles = articles.filter(function(a) { return a.id !== id; });
            localStorage.setItem("articlesUNDR", JSON.stringify(articles));
            afficherArticles();
        }
        return;
    }
    if (e.target.classList.contains("btn-modifier")) {
        var id = Number(e.target.dataset.id);
        var art = articles.find(function(a) { return a.id === id; });
        if (!art) return;
        document.getElementById("nouveau-titre").value = art.titre;
        document.getElementById("nouvelle-categorie").value = art.categorie;
        document.getElementById("editeur-contenu").innerHTML = art.contenu || "";
        document.getElementById("nouvelle-video").value = art.video || "";
        videoFichierData = art.videoFichier || null;
        modeEdition = true; idEdition = id;
        document.getElementById("bouton-publier").textContent = "Enregistrer";
        document.getElementById("formulaire-ajout").scrollIntoView({ behavior: "smooth" });
        return;
    }
    if (e.target.classList.contains("select-importance")) return;
    var carte = e.target.closest(".article");
    if (carte) {
        var id = Number(carte.dataset.id);
        var art = articles.find(function(a) { return a.id === id; });
        if (art) ouvrirArticle(id);
    }
});

/* ================================================================
   COMPRESSION IMAGE VIA CANVAS (Android compatible)
   Convertit n'importe quelle image en JPEG compressé max 800px
   ================================================================ */
function compresserImage(fichier, callback) {
    var url = URL.createObjectURL(fichier);
    var img = new Image();
    img.onload = function() {
        var MAX = 800;
        var w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        URL.revokeObjectURL(url);
        callback(dataUrl);
    };
    img.onerror = function() {
        URL.revokeObjectURL(url);
        callback(null);
    };
    img.src = url;
}

/* APERÇU IMAGE ADMIN */
document.getElementById("nouvelle-image").addEventListener("change", function() {
    var f = this.files[0]; if (!f) return;
    compresserImage(f, function(dataUrl) {
        if (dataUrl) {
            document.getElementById("apercu-image-admin").innerHTML =
                "<img src='" + dataUrl + "' style='max-height:80px;border-radius:6px;margin-top:4px;'>";
        }
    });
});

document.getElementById("nouvelle-video-fichier").addEventListener("change", function() {
    var f = this.files[0]; if (!f) return;
    if (f.size > 250*1024*1024) { alert("Vidéo trop lourde. Maximum 250 Mo."); this.value = ""; return; }
    var r = new FileReader();
    r.onload = function(e) {
        videoFichierData = e.target.result;
        document.getElementById("apercu-video-admin").innerHTML =
            "<video src='" + e.target.result + "' style='max-height:100px;border-radius:6px;margin-top:4px;' controls></video>";
    };
    r.readAsDataURL(f);
});

/* PUBLIER / MODIFIER */
document.getElementById("bouton-publier").addEventListener("click", function() {
    var titre = (document.getElementById("nouveau-titre").value || "").trim();
    if (!titre) { alert("Merci d'entrer le titre de l'article."); return; }

    var editeur = document.getElementById("editeur-contenu");
    var contenu = editeur.innerHTML || "";
    var videoLien = (document.getElementById("nouvelle-video").value || "").trim();
    if (!contenu.replace(/<[^>]*>/g, "").trim() && !videoFichierData && !videoLien) {
        contenu = "<p>" + titre + "</p>";
    }

    var estEdition = modeEdition && idEdition !== null;

    function sauverArticle(imageData) {
        var obj = {
            titre: titre,
            contenu: contenu,
            categorie: document.getElementById("nouvelle-categorie").value,
            video: videoLien,
            videoFichier: videoFichierData || "",
            image: imageData || ""
        };

        if (estEdition) {
            for (var i = 0; i < articles.length; i++) {
                if (articles[i].id === idEdition) {
                    obj.id = articles[i].id;
                    obj.date = articles[i].date;
                    obj.importance = articles[i].importance || 0;
                    articles[i] = obj;
                    break;
                }
            }
            modeEdition = false; idEdition = null;
            document.getElementById("bouton-publier").textContent = "Publier";
        } else {
            obj.id = Date.now();
            obj.date = new Date().toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric"});
            obj.importance = 2;
            articles.unshift(obj);
        }

        try {
            localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        } catch(e) {
            /* Stockage plein : vider les anciennes images */
            articles = articles.map(function(a, idx) {
                return idx > 3 ? Object.assign({}, a, {image: "", videoFichier: ""}) : a;
            });
            localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        }

        document.getElementById("nouveau-titre").value = "";
        editeur.innerHTML = "";
        document.getElementById("nouvelle-video").value = "";
        document.getElementById("nouvelle-image").value = "";
        document.getElementById("nouvelle-video-fichier").value = "";
        document.getElementById("apercu-image-admin").innerHTML = "";
        document.getElementById("apercu-video-admin").innerHTML = "";
        videoFichierData = null;

        afficherArticles();
        afficherToast(estEdition ? "✅ Article modifié !" : "🎉 \"" + titre + "\" publié !");
        if (!estEdition) envoyerNotifLocale(titre);
    }

    var fichierImage = document.getElementById("nouvelle-image").files[0];
    if (fichierImage) {
        /* Compresser via Canvas — fonctionne sur tous les Android */
        compresserImage(fichierImage, function(dataUrl) {
            sauverArticle(dataUrl);
        });
    } else {
        var imgExist = "";
        if (estEdition) {
            for (var j = 0; j < articles.length; j++) {
                if (articles[j].id === idEdition) { imgExist = articles[j].image || ""; break; }
            }
        }
        sauverArticle(imgExist);
    }
});

/* ================================================================
   PROCHAINS ÉVÉNEMENTS
   ================================================================ */
var evenements = JSON.parse(localStorage.getItem("evenementsUNDR") || "[]");
var indexEvenementActif = 0;
var intervalleEvenements = null;

document.getElementById("evenement-image").addEventListener("change", function() {
    var f = this.files[0]; if (!f) return;
    compresserImage(f, function(dataUrl) {
        if (dataUrl) {
            document.getElementById("apercu-evenement-image").innerHTML =
                "<img src='" + dataUrl + "' style='max-height:80px;border-radius:6px;margin-top:4px;'>";
        }
    });
});

document.getElementById("btn-publier-evenement").addEventListener("click", function() {
    var titre = (document.getElementById("evenement-titre").value || "").trim();
    var texte = (document.getElementById("evenement-texte").value || "").trim();
    var date  = document.getElementById("evenement-date").value || "";
    if (!titre) { alert("Merci d'entrer le titre de l'événement."); return; }
    if (!date) { alert("Merci de choisir la date de l'événement dans le calendrier."); return; }

    function sauverEvenement(imageData) {
        evenements.unshift({
            id: Date.now(),
            titre: titre,
            texte: texte,
            date: date,
            image: imageData || ""
        });
        try {
            localStorage.setItem("evenementsUNDR", JSON.stringify(evenements));
        } catch(e) {
            evenements = evenements.map(function(ev, idx) {
                return idx > 3 ? Object.assign({}, ev, {image:""}) : ev;
            });
            localStorage.setItem("evenementsUNDR", JSON.stringify(evenements));
        }
        document.getElementById("evenement-titre").value = "";
        document.getElementById("evenement-texte").value = "";
        document.getElementById("evenement-date").value = "";
        document.getElementById("evenement-image").value = "";
        document.getElementById("apercu-evenement-image").innerHTML = "";
        afficherEvenements();
        afficherListeEvenementsAdmin();
        afficherToast("🎉 Événement publié !");
    }

    var fichier = document.getElementById("evenement-image").files[0];
    if (fichier) {
        compresserImage(fichier, function(dataUrl) { sauverEvenement(dataUrl); });
    } else {
        sauverEvenement("");
    }
});

function evenementEstPasse(ev) {
    if (!ev.date) return false;
    var finDeJournee = new Date(ev.date + "T23:59:59");
    return finDeJournee < new Date();
}

function afficherListeEvenementsAdmin() {
    var zone = document.getElementById("liste-evenements-admin");
    if (!zone) return;
    if (!evenements.length) { zone.innerHTML = "<p style='color:#888;font-size:13px;'>Aucune annonce.</p>"; return; }
    zone.innerHTML = evenements.map(function(ev, i) {
        var passe = evenementEstPasse(ev);
        var dateAffichee = ev.date ? new Date(ev.date + "T00:00:00").toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric"}) : "—";
        return "<div class='adhesion-item'>" +
            (ev.image ? "<img src='" + ev.image + "' style='width:100%;max-height:90px;object-fit:cover;border-radius:6px;margin-bottom:6px;'>" : "") +
            "<strong>" + ev.titre + "</strong> " +
            (passe ? "<span class='badge-statut attente'>⏱ Expiré</span>" : "<span class='badge-statut valide'>📅 " + dateAffichee + "</span>") +
            (ev.texte ? "<br><small>" + ev.texte.substring(0,80) + (ev.texte.length>80?"…":"") + "</small>" : "") +
            "<br><button class='btn-suppr-abo' data-index='" + i + "'>🗑 Supprimer</button></div>";
    }).join("");
    zone.querySelectorAll(".btn-suppr-abo").forEach(function(b) {
        b.addEventListener("click", function() {
            evenements.splice(Number(b.dataset.index), 1);
            localStorage.setItem("evenementsUNDR", JSON.stringify(evenements));
            afficherEvenements();
            afficherListeEvenementsAdmin();
        });
    });
}

function afficherEvenements() {
    var widget = document.getElementById("widget-evenements");
    var carrousel = document.getElementById("evenements-carrousel");
    if (!widget || !carrousel) return;

    if (intervalleEvenements) { clearInterval(intervalleEvenements); intervalleEvenements = null; }

    var evenementsActifs = evenements.filter(function(ev) { return !evenementEstPasse(ev); });

    if (!evenementsActifs.length) {
        widget.style.display = "none";
        carrousel.innerHTML = "";
        return;
    }

    widget.style.display = "block";
    indexEvenementActif = 0;

    function carteHTML(ev, couleurIndex) {
        return "<div class='evenement-carte couleur-" + (couleurIndex % 5) + "'>" +
            (ev.image ? "<img src='" + ev.image + "' class='evenement-img' alt=''>" : "<div class='evenement-img' style='display:flex;align-items:center;justify-content:center;font-size:28px;'>🗓️</div>") +
            "<div class='evenement-texte'><h3>" + ev.titre + "</h3>" +
            (ev.texte ? "<p>" + ev.texte + "</p>" : "") +
            "</div></div>";
    }

    /* Piste : toutes les annonces + une copie de la 1ère à la fin pour boucler sans à-coup */
    var htmlCartes = evenementsActifs.map(function(ev, i) { return carteHTML(ev, i); }).join("");
    if (evenementsActifs.length > 1) htmlCartes += carteHTML(evenementsActifs[0], 0);
    carrousel.innerHTML = "<div class='evenements-piste' id='evenements-piste'>" + htmlCartes + "</div>";

    var piste = document.getElementById("evenements-piste");
    piste.style.transform = "translateX(0)";

    if (evenementsActifs.length > 1) {
        var total = evenementsActifs.length;
        intervalleEvenements = setInterval(function() {
            indexEvenementActif++;
            piste.style.transition = "transform .7s ease";
            piste.style.transform = "translateX(-" + (indexEvenementActif * 100) + "%)";
            if (indexEvenementActif === total) {
                /* On vient d'afficher la copie : au bout de la transition, saut instantané au début */
                setTimeout(function() {
                    piste.style.transition = "none";
                    piste.style.transform = "translateX(0)";
                    indexEvenementActif = 0;
                    piste.offsetHeight; /* forcer le recalcul avant de réactiver la transition */
                }, 720);
            }
        }, 4500);
    }
}


/* ================================================================
   MODAL COTISATIONS STATUTAIRES
   ================================================================ */
function ouvrirModalCotisations() {
    document.getElementById("modal-cotisations").style.display = "flex";
}
function fermerModalCotisations() { document.getElementById("modal-cotisations").style.display = "none"; }
document.getElementById("fermer-cotisations").addEventListener("click", fermerModalCotisations);
document.getElementById("cotisations-fermer-bas").addEventListener("click", fermerModalCotisations);
document.getElementById("modal-cotisations").addEventListener("click", function(e) { if (e.target === this) fermerModalCotisations(); });

/* ================================================================
   MODAL DON
   ================================================================ */
function ouvrirModalDon() {
    document.getElementById("don-etape-1").style.display = "block";
    document.getElementById("don-etape-2").style.display = "none";
    document.getElementById("modal-don").style.display = "flex";
}
function fermerModalDon() { document.getElementById("modal-don").style.display = "none"; }
document.getElementById("fermer-don").addEventListener("click", fermerModalDon);
document.getElementById("modal-don").addEventListener("click", function(e) { if (e.target === this) fermerModalDon(); });

document.querySelectorAll(".don-montant-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        document.getElementById("don-montant-choisi").textContent = btn.dataset.montant;
        document.getElementById("don-etape-1").style.display = "none";
        document.getElementById("don-etape-2").style.display = "block";
    });
});
document.getElementById("don-retour").addEventListener("click", function() {
    document.getElementById("don-etape-2").style.display = "none";
    document.getElementById("don-etape-1").style.display = "block";
});

/* ================================================================
   MODAL ADHÉSION + 3. PDF CORRIGÉ
   ================================================================ */
function ouvrirModalAdhesion() {
    ["adh-nom","adh-tel","adh-region","adh-organe","adh-poste"].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = "";
    });
    var n = document.getElementById("adh-naissance"); if (n) n.value = "";
    document.getElementById("apercu-photo").innerHTML = "";
    var acc = document.getElementById("adh-accord"); if (acc) acc.checked = false;
    document.getElementById("etape-adhesion-1").style.display = "block";
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-3").style.display = "none";
    document.getElementById("modal-adhesion").style.display = "flex";
}
function fermerModalAdhesion() { document.getElementById("modal-adhesion").style.display = "none"; }
document.getElementById("fermer-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("fermer-succes-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("modal-adhesion").addEventListener("click", function(e) { if (e.target === this) fermerModalAdhesion(); });

document.getElementById("adh-naissance").addEventListener("input", function() {
    var chiffres = this.value.replace(/\D/g, "").slice(0, 8);
    var formate = chiffres;
    if (chiffres.length > 4) formate = chiffres.slice(0,2) + "/" + chiffres.slice(2,4) + "/" + chiffres.slice(4);
    else if (chiffres.length > 2) formate = chiffres.slice(0,2) + "/" + chiffres.slice(2);
    this.value = formate;
});

document.getElementById("adh-photo").addEventListener("change", function() {
    var f = this.files[0]; if (!f) return;
    /* Accepter jusqu'à 10 Mo, compresser via Canvas */
    if (f.size > 10*1024*1024) { alert("Photo trop lourde (max 10 Mo)."); this.value = ""; return; }
    compresserImage(f, function(dataUrl) {
        if (dataUrl) {
            document.getElementById("apercu-photo").innerHTML =
                "<img src='" + dataUrl + "' style='max-width:100%;max-height:110px;border-radius:6px;margin-top:6px;'>";
            /* Stocker temporairement pour la soumission */
            window._photoAdhesionTemp = dataUrl;
        } else {
            alert("Impossible de lire la photo. Essayez une autre image.");
        }
    });
});

document.getElementById("btn-suivant-adhesion").addEventListener("click", function() {
    var nom = document.getElementById("adh-nom").value.trim();
    var naiss = document.getElementById("adh-naissance").value;
    var tel = document.getElementById("adh-tel").value.trim();
    var reg = document.getElementById("adh-region").value.trim();
    var photo = document.getElementById("adh-photo").files[0];
    if (!nom || !naiss || !tel || !reg || !photo) { alert("Merci de remplir tous les champs obligatoires (*)."); return; }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(naiss)) { alert("Merci d'entrer la date de naissance complète, au format JJ/MM/AAAA."); return; }
    var org = document.getElementById("adh-organe").value.trim();
    var post = document.getElementById("adh-poste").value.trim();
    document.getElementById("recapitulatif-adhesion").innerHTML =
        "<div class='recap-ligne'><span>Nom :</span><strong>" + nom + "</strong></div>" +
        "<div class='recap-ligne'><span>Naissance :</span><strong>" + naiss + "</strong></div>" +
        "<div class='recap-ligne'><span>Téléphone :</span><strong>" + tel + "</strong></div>" +
        "<div class='recap-ligne'><span>Région :</span><strong>" + reg + "</strong></div>" +
        (org ? "<div class='recap-ligne'><span>Organe :</span><strong>" + org + "</strong></div>" : "") +
        (post ? "<div class='recap-ligne'><span>Poste :</span><strong>" + post + "</strong></div>" : "") +
        "<div class='recap-ligne'><span>Photo :</span><strong>✅ Jointe</strong></div>";
    document.getElementById("etape-adhesion-1").style.display = "none";
    document.getElementById("etape-adhesion-2").style.display = "block";
});

document.getElementById("btn-retour-adhesion").addEventListener("click", function() {
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-1").style.display = "block";
});

document.getElementById("btn-soumettre-adhesion").addEventListener("click", function() {
    if (!document.getElementById("adh-accord").checked) { 
        alert("Vous devez accepter la charte et les statuts de l'UNDR pour continuer."); 
        return; 
    }
    var num = "UNDR-" + Date.now().toString().slice(-6);
    var d = {
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
    var photoFile = document.getElementById("adh-photo").files[0];

    function finaliser(photoDataUrl) {
        /* Sauvegarder la demande AVEC la photo pour que l'admin puisse générer le PDF complet */
        var dAvecPhoto = Object.assign({}, d, { photoBase64: photoDataUrl || "" });
        var dem = JSON.parse(localStorage.getItem("adhesionsUNDR") || "[]");
        dem.push(dAvecPhoto);
        localStorage.setItem("adhesionsUNDR", JSON.stringify(dem));
        if (window.db) {
            /* Firebase : on envoie sans la photo (trop lourde) */
            window.db.collection("adhesions").add(Object.assign({}, d, { date: firebase.firestore.FieldValue.serverTimestamp() })).catch(function(){});
        }
        derniereDemande = { data: d, photo: photoDataUrl };
        document.getElementById("num-dossier").textContent = num;
        document.getElementById("etape-adhesion-2").style.display = "none";
        document.getElementById("etape-adhesion-3").style.display = "block";
        var btnR = document.getElementById("btn-retelecharger-pdf");
        if (btnR) btnR.onclick = function() { if (derniereDemande) genererPDF(derniereDemande.data, derniereDemande.photo); };
        genererPDF(d, photoDataUrl);
    }

    if (photoFile) {
        /* Utiliser la photo déjà compressée si disponible, sinon relire */
        if (window._photoAdhesionTemp) {
            finaliser(window._photoAdhesionTemp);
            window._photoAdhesionTemp = null;
        } else {
            compresserImage(photoFile, function(dataUrl) {
                finaliser(dataUrl);
            });
        }
    } else finaliser(null);
});

/* 3. GÉNÉRATION PDF */
var LOGO_UNDR_PDF_B64 = "data:image/png;base64,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";
var LOGO_IS_PDF_B64 = "data:image/png;base64,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";

function genererPDF(d, photoDataUrl) {
    if (window.jspdf && window.jspdf.jsPDF) {
        try {
            var jsPDF = window.jspdf.jsPDF;
            var doc = new jsPDF({ unit:"mm", format:"a4" });
            doc.setFillColor(230,126,34); doc.rect(0,0,210,36,"F");
            /* Logo UNDR à gauche, sur fond blanc rond */
            try {
                doc.setFillColor(255,255,255); doc.circle(24,18,11,"F");
                var lw=16, lh=lw*(160/129);
                doc.addImage(LOGO_UNDR_PDF_B64,"PNG",24-lw/2,18-lh/2,lw,lh);
            } catch(e){}
            /* Logo International Socialiste à droite, sans fond */
            try {
                var gw=14, gh=gw*(160/113);
                doc.addImage(LOGO_IS_PDF_B64,"PNG",186-gw/2,18-gh/2,gw,gh);
            } catch(e){}
            doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont("helvetica","bold");
            doc.text("Union Nationale pour le Développement et le Renouveau", 105, 9, {align:"center"});
            doc.setFontSize(8); doc.setFont("helvetica","normal");
            doc.text("Paix — Discipline — Travail", 105, 15, {align:"center"});
            doc.setFontSize(21); doc.setFont("helvetica","bold");
            doc.text("FICHE D'ADHÉSION", 105, 29, {align:"center"});
            doc.setFillColor(0,51,102); doc.rect(0,36,210,4,"F");
            doc.setFillColor(240,244,255); doc.roundedRect(14,46,182,12,2,2,"F");
            doc.setTextColor(0,51,102); doc.setFontSize(10); doc.setFont("helvetica","bold");
            doc.text("Dossier : " + d.id, 20, 54);
            doc.setTextColor(100,100,100); doc.setFontSize(9); doc.setFont("helvetica","normal");
            doc.text("Date : " + d.date, 170, 54, {align:"right"});
            var px=155,py=64,pw=40,ph=48;
            doc.setDrawColor(0,51,102); doc.setLineWidth(0.6); doc.rect(px,py,pw,ph);
            if (photoDataUrl) { try { doc.addImage(photoDataUrl,"JPEG",px+0.5,py+0.5,pw-1,ph-1); } catch(e){} }
            var y=68;
            doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(0,51,102);
            doc.text("Informations personnelles", 14, y);
            doc.setFillColor(230,126,34); doc.rect(14,y+2,55,0.8,"F");
            y+=10;
            [[d.nom,"Nom et Prénom"],[d.naissance,"Date de naissance"],[d.tel,"Téléphone"],[d.region,"Région"],[d.organe||"—","Organe du Parti"],[d.poste||"—","Poste"]].forEach(function(c){
                doc.setFillColor(248,249,255); doc.roundedRect(14,y-4.5,134,9,1,1,"F");
                doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(0,51,102);
                doc.text(c[1]+" :", 18, y);
                doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40);
                doc.text(c[0], 65, y); y+=12;
            });
            y+=2; doc.setFillColor(0,51,102); doc.rect(0,y,210,0.4,"F"); y+=6;
            doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(0,51,102);
            doc.text("Charte d'adhésion", 14, y); y+=8;
            doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(50,50,50);
            ["• Respecter les statuts et règlements du parti","• Contribuer activement aux activités","• Défendre les valeurs de démocratie et de développement","• Payer la cotisation annuelle"].forEach(function(l){ doc.text(l,18,y); y+=7; });
            y+=4;
            doc.setFillColor(240,244,255); doc.roundedRect(14,y,84,26,2,2,"F");
            doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,51,102);
            doc.text("Signature du membre", 56, y+7, {align:"center"});
            doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
            doc.text("(Lu et approuvé)", 56, y+13, {align:"center"});
            doc.setDrawColor(0,51,102); doc.setLineWidth(0.3); doc.line(22,y+22,88,y+22);
            doc.setFillColor(240,244,255); doc.roundedRect(110,y,84,26,2,2,"F");
            doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,51,102);
            doc.text("Visa du responsable UNDR", 152, y+7, {align:"center"});
            doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
            doc.text("Cachet et signature", 152, y+13, {align:"center"});
            doc.line(118,y+22,188,y+22);
            doc.setFillColor(0,51,102); doc.rect(0,280,210,17,"F");
            doc.setFillColor(230,126,34); doc.rect(0,278.5,210,1.5,"F");
            doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
            doc.text("UNDR — +235 66 79 77 51 — gouatainebienvenu3@gmail.com", 105, 287, {align:"center"});
            doc.text("Document généré le " + d.date, 105, 292, {align:"center"});
            doc.save("adhesion_" + d.id + ".pdf");
            return;
        } catch(err) { console.error(err); }
    }
    /* Fallback HTML imprimable */
    var photoHTML = photoDataUrl ? "<img src='" + photoDataUrl + "' style='width:100%;height:100%;object-fit:cover;'>" : "<p style='color:#999;text-align:center;margin-top:30px;font-size:11px;'>Photo d'identité</p>";
    var html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Adhésion " + d.id + "</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;}.entete{background:#003366;color:white;padding:14px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;}.entete-logo-orange{width:54px;height:54px;border-radius:50%;background:#fff;padding:5px;box-sizing:border-box;flex-shrink:0;}.entete-logo-vert{width:42px;flex-shrink:0;}.entete-texte{flex:1;text-align:center;}.entete-texte h2{font-size:13px;line-height:1.3;}.entete-texte .devise{font-size:10px;opacity:0.9;margin:3px 0;}.entete-texte .titre-fiche{font-size:26px;font-weight:900;margin-top:4px;letter-spacing:0.5px;}.bande{height:5px;background:#e67e22;}.corps{padding:16px;display:flex;gap:16px;}.infos{flex:1;}.photo{width:105px;flex-shrink:0;}.cadre{width:100px;height:120px;border:2px solid #003366;overflow:hidden;}.num{background:#f0f4ff;padding:10px;border-radius:6px;margin-bottom:14px;font-size:13px;}.num strong{color:#003366;font-size:15px;}table{width:100%;border-collapse:collapse;margin-bottom:14px;}td{padding:6px 8px;font-size:12px;border-bottom:1px solid #eee;}td:first-child{font-weight:bold;color:#003366;width:40%;}.charte{background:#f8f9fa;padding:10px;border-radius:6px;font-size:11px;margin-bottom:14px;}.charte p{font-weight:bold;margin-bottom:4px;}.sigs{display:flex;gap:14px;}.sig{flex:1;background:#f0f4ff;padding:10px;border-radius:6px;font-size:11px;text-align:center;}.sl{border-top:1px solid #003366;margin-top:28px;padding-top:4px;color:#888;}.pied{background:#003366;color:white;padding:10px;text-align:center;font-size:10px;margin-top:16px;}@media print{.np{display:none;}}</style></head><body>";
    html += "<div class='np' style='background:#e67e22;color:white;padding:10px;text-align:center;'><button onclick='window.print()' style='background:white;color:#e67e22;border:none;padding:8px 20px;border-radius:20px;font-weight:bold;cursor:pointer;'>🖨️ Imprimer / Sauvegarder en PDF</button></div>";
    html += "<div class='entete'><img class='entete-logo-orange' src='" + LOGO_UNDR_PDF_B64 + "' alt='UNDR'><div class='entete-texte'><h2>Union Nationale pour le Développement et le Renouveau</h2><p class='devise'>Paix — Discipline — Travail</p><p class='titre-fiche'>FICHE D'ADHÉSION</p></div><img class='entete-logo-vert' src='" + LOGO_IS_PDF_B64 + "' alt='Internationale Socialiste'></div><div class='bande'></div><div style='padding:16px;'><div class='num'>Dossier : <strong>" + d.id + "</strong> &nbsp; Date : " + d.date + "</div><div class='corps'><div class='infos'><table><tr><td>Nom et Prénom</td><td>" + d.nom + "</td></tr><tr><td>Date de naissance</td><td>" + d.naissance + "</td></tr><tr><td>Téléphone</td><td>" + d.tel + "</td></tr><tr><td>Région</td><td>" + d.region + "</td></tr><tr><td>Organe du Parti</td><td>" + (d.organe||"—") + "</td></tr><tr><td>Poste</td><td>" + (d.poste||"—") + "</td></tr></table></div><div class='photo'><div class='cadre'>" + photoHTML + "</div><p style='font-size:10px;color:#888;text-align:center;margin-top:4px;'>Photo d'identité</p></div></div><div class='charte'><p>Charte d'adhésion — En adhérant je m'engage à :</p><ul style='margin-left:14px;'><li>Respecter les statuts du parti</li><li>Contribuer aux activités du mouvement</li><li>Défendre les valeurs de démocratie</li><li>Payer la cotisation annuelle</li></ul></div><div class='sigs'><div class='sig'>Signature du membre<div class='sl'></div></div><div class='sig'>Visa du responsable<div class='sl'></div></div></div></div><div class='pied'>UNDR — +235 66 79 77 51 — Document généré le " + d.date + "</div><script>setTimeout(function(){window.print();},600);</scr" + "ipt></body></html>";
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "adhesion_" + d.id + ".html";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 3000);
}

/* ================================================================
   PREMIUM/ABONNEMENT — fonctionnalité retirée, contenu toujours libre
   ================================================================ */
function estPremiumEffectif(art) { return false; }

/* ADMIN LISTES */
function chargerAdhesionsAdmin() {
    var zone = document.getElementById("liste-adhesions"); if (!zone) return;
    var dem = JSON.parse(localStorage.getItem("adhesionsUNDR") || "[]");
    if (!dem.length) { zone.innerHTML = "<p style='color:#888;font-size:13px;'>Aucune demande.</p>"; return; }
    zone.innerHTML = dem.map(function(d, i) {
        return "<div class='adhesion-item'>" +
            "<strong>" + d.nom + "</strong> — " + d.region + " — 📞 " + d.tel + "<br>" +
            (d.organe ? "<small>Organe: " + d.organe + " | Poste: " + (d.poste||"—") + "</small><br>" : "") +
            "<small>" + d.naissance + " | " + d.id + " | " + d.date + "</small><br>" +
            "<span class='badge-statut " + (d.statut==="Validé"?"valide":"attente") + "'>" + d.statut + "</span>" +
            (d.statut!=="Validé" ? "<button class='btn-valider-adhesion' data-index='" + i + "'>✅ Valider</button>" : "") +
            "<button class='btn-pdf-adhesion' data-index='" + i + "'>📄 PDF</button>" +
            "<button class='btn-suppr-adhesion' data-index='" + i + "'>🗑</button>" +
        "</div>";
    }).join("");
    zone.querySelectorAll(".btn-valider-adhesion").forEach(function(b) {
        b.addEventListener("click", function() {
            var d = JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
            d[Number(b.dataset.index)].statut = "Validé";
            localStorage.setItem("adhesionsUNDR", JSON.stringify(d)); chargerAdhesionsAdmin();
        });
    });
    /* 1. Bouton PDF pour chaque adhésion dans la liste admin — avec photo */
    zone.querySelectorAll(".btn-pdf-adhesion").forEach(function(b) {
        b.addEventListener("click", function() {
            var dem2 = JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
            var adhesion = dem2[Number(b.dataset.index)];
            if (adhesion) {
                /* Récupérer la photo sauvegardée avec la demande */
                var photo = adhesion.photoBase64 || null;
                genererPDF(adhesion, photo);
            }
        });
    });
    zone.querySelectorAll(".btn-suppr-adhesion").forEach(function(b) {
        b.addEventListener("click", function() {
            var d = JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
            d.splice(Number(b.dataset.index),1);
            localStorage.setItem("adhesionsUNDR", JSON.stringify(d)); chargerAdhesionsAdmin();
        });
    });
}
/* PUBLICITÉS */
function chargerPubsAdmin() {
    var ph=JSON.parse(localStorage.getItem("pubHautUNDR")||"null");
    var pb=JSON.parse(localStorage.getItem("pubBasUNDR")||"null");
    if(ph){document.getElementById("pub-haut-titre").value=ph.titre||"";document.getElementById("pub-haut-lien").value=ph.lien||"";}
    if(pb){document.getElementById("pub-bas-titre").value=pb.titre||"";document.getElementById("pub-bas-lien").value=pb.lien||"";}
}
function afficherPubMaison(zone,data){
    if(!data||!data.image){zone.style.display="none";return;}
    zone.style.display="block";
    zone.innerHTML="<a href='"+(data.lien||"#")+"' target='_blank' class='pub-maison-lien'><img src='"+data.image+"' class='pub-maison-img' alt='Pub'><span class='pub-label'>Publicité</span></a>";
}
function rafraichirPubs(){
    afficherPubMaison(document.getElementById("pub-maison-haut"),JSON.parse(localStorage.getItem("pubHautUNDR")||"null"));
    afficherPubMaison(document.getElementById("pub-maison-bas"),JSON.parse(localStorage.getItem("pubBasUNDR")||"null"));
}
function enregistrerPub(cle,tId,lId,iId){
    var t=document.getElementById(tId).value.trim(),l=document.getElementById(lId).value.trim(),f=document.getElementById(iId).files[0];
    function s(img){localStorage.setItem(cle,JSON.stringify({titre:t,lien:l,image:img}));rafraichirPubs();alert("Pub enregistrée !");}
    if(f){var r=new FileReader();r.onload=function(e){s(e.target.result);};r.readAsDataURL(f);}
    else{var ex=JSON.parse(localStorage.getItem(cle)||"null");s(ex?ex.image:"");}
}
document.getElementById("btn-sauver-pub-haut").addEventListener("click",function(){enregistrerPub("pubHautUNDR","pub-haut-titre","pub-haut-lien","pub-haut-image");});
document.getElementById("btn-sauver-pub-bas").addEventListener("click",function(){enregistrerPub("pubBasUNDR","pub-bas-titre","pub-bas-lien","pub-bas-image");});

/* DIRECT */
document.getElementById("toggle-direct").addEventListener("click", function() {
    var z=document.getElementById("zone-direct");
    z.style.display = z.style.display==="none" ? "block" : "none";
});

/* MODE SOMBRE */
var ts=document.getElementById("toggle-sombre");
if(localStorage.getItem("modeSombreUNDR")==="true"){document.body.classList.add("mode-sombre");ts.checked=true;}
ts.addEventListener("change",function(){document.body.classList.toggle("mode-sombre",ts.checked);localStorage.setItem("modeSombreUNDR",ts.checked);});

/* TAILLE TEXTE */
function appliquerTaille(n){var t={petit:"14px",normal:"16px",grand:"19px"};document.body.style.fontSize=t[n]||"16px";localStorage.setItem("tailleTexteUNDR",n);}
document.querySelectorAll(".taille-btn").forEach(function(b){b.addEventListener("click",function(){appliquerTaille(b.dataset.taille);});});
appliquerTaille(localStorage.getItem("tailleTexteUNDR")||"normal");

/* ================================================================
   LANGUE — TRADUCTIONS COMPLÈTES
   ================================================================ */
var TRADUCTIONS = {
    fr: {
        /* Filtres */
        "cat_toutes": "⭐ À la Une", "cat_actu": "Actualités", "cat_activ": "Activités",
        "cat_com": "Communiqués", "cat_bne": "Portraits BNE", "cat_tchad": "Tchad",
        "cat_pol": "Politique", "cat_div": "Divertissement",
        /* Menus */
        "menu_adherer": "Adhérer à l'UNDR", "menu_abonner": "S'abonner",
        "menu_statut_ri": "Statut & RI de l'UNDR", "menu_partager": "Partager l'application",
        "menu_langue": "Langue", "menu_apparence": "Apparence",
        "menu_sombre": "Mode sombre", "menu_taille": "Taille du texte",
        /* Bandeau */
        "bandeau_texte": "Contenu réservé aux abonnés",
        "btn_adherer": "Adhérer", "btn_abonner": "S'abonner",
        /* Header */
        "titre_site": "UNDR Actualités",
        /* Boutons */
        "btn_retour": "← Retour", "btn_partager_art": "Partager sur Facebook",
        "btn_envoyer": "Envoyer", "btn_direct": "Suivre le Direct",
        /* Verrou */
        "verrou_titre": "Contenu réservé aux abonnés",
        "verrou_texte": "Abonnez-vous pour accéder à l'intégralité de cet article.",
        "btn_abo_verrou": "S'abonner — 1 000 FCFA/mois",
        /* Adhésion */
        "adh_titre": "Adhérer à l'UNDR",
        "adh_sous": "Rejoignez le mouvement pour l'espoir et le renouveau du Tchad",
        "adh_identite": "Votre identité", "adh_naissance": "Date de naissance *",
        "adh_photo": "Photo d'identité * (max 2 Mo)",
        "adh_confirm": "Confirmation", "adh_succes": "Demande envoyée !",
        "adh_succes_texte": "Un responsable de l'UNDR vous contactera sous 48h.",
        "charte_titre": "En adhérant à l'UNDR, je m'engage à :",
        "charte_accord": "J'accepte la charte et les statuts de l'UNDR",
        "btn_suivant": "Suivant →", "btn_retour_f": "← Retour",
        "btn_soumettre": "✅ Soumettre", "btn_fermer": "Fermer",
        /* Abonnement */
        "abo_titre": "Abonnement Premium",
        "abo_sous": "Accédez à tous les contenus exclusifs de l'UNDR",
        "abo_av1": "Tous les articles sans restriction",
        "abo_av2": "Actualités politiques exclusives",
        "abo_av3": "Communiqués officiels complets",
        "abo_av4": "Divertissement & contenus spéciaux",
        /* Prochains événements */
        "evenements_titre": "🗓️ Prochains événements",
        /* Lire aussi */
        "lire_aussi": "Lire aussi",
        /* Admin formulaire */
        "form_titre": "Ajouter un article", "btn_publier": "Publier"
    },
    en: {
        "cat_toutes": "⭐ Top Stories", "cat_actu": "News", "cat_activ": "Activities",
        "cat_com": "Press releases", "cat_bne": "BNE Portraits", "cat_tchad": "Chad",
        "cat_pol": "Politics", "cat_div": "Entertainment",
        "menu_adherer": "Join UNDR", "menu_abonner": "Subscribe",
        "menu_statut_ri": "UNDR Statutes & IR", "menu_partager": "Share the app",
        "menu_langue": "Language", "menu_apparence": "Appearance",
        "menu_sombre": "Dark mode", "menu_taille": "Text size",
        "bandeau_texte": "Content for subscribers only",
        "btn_adherer": "Join", "btn_abonner": "Subscribe",
        "titre_site": "UNDR News",
        "btn_retour": "← Back", "btn_partager_art": "Share on Facebook",
        "btn_envoyer": "Send", "btn_direct": "Watch Live",
        "verrou_titre": "Subscribers only",
        "verrou_texte": "Subscribe to access the full article.",
        "btn_abo_verrou": "Subscribe — 1,000 FCFA/month",
        "adh_titre": "Join UNDR",
        "adh_sous": "Join the movement for hope and renewal of Chad",
        "adh_identite": "Your identity", "adh_naissance": "Date of birth *",
        "adh_photo": "ID photo * (max 2 MB)",
        "adh_confirm": "Confirmation", "adh_succes": "Request sent!",
        "adh_succes_texte": "An UNDR representative will contact you within 48h.",
        "charte_titre": "By joining UNDR, I commit to:",
        "charte_accord": "I accept the UNDR charter and statutes",
        "btn_suivant": "Next →", "btn_retour_f": "← Back",
        "btn_soumettre": "✅ Submit", "btn_fermer": "Close",
        "abo_titre": "Premium Subscription",
        "abo_sous": "Access all exclusive UNDR content",
        "abo_av1": "All articles without restriction",
        "abo_av2": "Exclusive political news",
        "abo_av3": "Full official press releases",
        "abo_av4": "Entertainment & special content",
        "evenements_titre": "🗓️ Upcoming events",
        "lire_aussi": "Read also",
        "form_titre": "Add an article", "btn_publier": "Publish"
    },
    ar: {
        "cat_toutes": "⭐ الأبرز", "cat_actu": "أخبار", "cat_activ": "أنشطة",
        "cat_com": "بيانات", "cat_bne": "صور المكتب", "cat_tchad": "تشاد",
        "cat_pol": "سياسة", "cat_div": "ترفيه",
        "menu_adherer": "الانضمام إلى UNDR", "menu_abonner": "الاشتراك",
        "menu_statut_ri": "النظام الأساسي والنظام الداخلي", "menu_partager": "مشاركة التطبيق",
        "menu_langue": "اللغة", "menu_apparence": "المظهر",
        "menu_sombre": "الوضع المظلم", "menu_taille": "حجم الخط",
        "bandeau_texte": "محتوى مخصص للمشتركين",
        "btn_adherer": "انضم", "btn_abonner": "اشترك",
        "titre_site": "أخبار UNDR",
        "btn_retour": "رجوع →", "btn_partager_art": "مشاركة على فيسبوك",
        "btn_envoyer": "إرسال", "btn_direct": "متابعة البث",
        "verrou_titre": "محتوى للمشتركين فقط",
        "verrou_texte": "اشترك للوصول إلى المقال كاملاً.",
        "btn_abo_verrou": "اشترك — 1 000 فرنك/شهر",
        "adh_titre": "الانضمام إلى UNDR",
        "adh_sous": "انضم إلى حركة الأمل وتجديد تشاد",
        "adh_identite": "هويتك", "adh_naissance": "تاريخ الميلاد *",
        "adh_photo": "صورة الهوية * (أقصى 2 ميغا)",
        "adh_confirm": "تأكيد", "adh_succes": "تم إرسال الطلب!",
        "adh_succes_texte": "سيتصل بك مسؤول UNDR خلال 48 ساعة.",
        "charte_titre": "بانضمامي إلى UNDR أتعهد بـ:",
        "charte_accord": "أوافق على ميثاق UNDR",
        "btn_suivant": "التالي ←", "btn_retour_f": "رجوع →",
        "btn_soumettre": "✅ إرسال", "btn_fermer": "إغلاق",
        "abo_titre": "اشتراك مميز",
        "abo_sous": "الوصول إلى جميع محتويات UNDR الحصرية",
        "abo_av1": "جميع المقالات بدون قيود",
        "abo_av2": "أخبار سياسية حصرية",
        "abo_av3": "بيانات رسمية كاملة",
        "abo_av4": "ترفيه ومحتوى خاص",
        "evenements_titre": "🗓️ الفعاليات القادمة",
        "lire_aussi": "اقرأ أيضاً",
        "form_titre": "إضافة مقال", "btn_publier": "نشر"
    }
};

var langueActuelle = localStorage.getItem("langueUNDR") || "fr";

function appliquerLangue(lang) {
    langueActuelle = lang;
    localStorage.setItem("langueUNDR", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    var t = TRADUCTIONS[lang] || TRADUCTIONS["fr"];

    /* Traduire tous les éléments avec data-i18n */
    document.querySelectorAll("[data-i18n]").forEach(function(el) {
        var cle = el.getAttribute("data-i18n");
        if (t[cle]) el.textContent = t[cle];
    });

    /* Traduire les filtres */
    document.querySelectorAll(".filtre-btn").forEach(function(btn) {
        var cat = btn.dataset.categorie;
        var map = {
            "Toutes": t["cat_toutes"], "Actualités": t["cat_actu"],
            "Activités": t["cat_activ"], "Communiqués": t["cat_com"],
            "Portraits des membres du BNE": t["cat_bne"], "Actualités Tchad": t["cat_tchad"],
            "Actualités Politique": t["cat_pol"], "Divertissement": t["cat_div"]
        };
        if (map[cat]) btn.textContent = map[cat];
    });

    /* Traduire les boutons du menu */
    var menuItems = {
        "menu-btn-adherer": t["menu_adherer"],
        "menu-btn-statut-ri": t["menu_statut_ri"],
        "menu-btn-partager": t["menu_partager"]
    };
    Object.keys(menuItems).forEach(function(id) {
        var el = document.getElementById(id);
        /* Garder l'icône, remplacer seulement le texte */
        if (el && menuItems[id]) {
            var icone = el.textContent.charAt(0) + el.textContent.charAt(1);
            el.textContent = icone + " " + menuItems[id];
        }
    });

    /* Titre du site */
    var titre = document.querySelector(".titre-site");
    if (titre && t["titre_site"]) titre.textContent = t["titre_site"];

    /* Placeholders */
    var pls = {
        "nouveau-titre":   {fr:"Titre de l'article", en:"Article title", ar:"عنوان المقال"},
        "adh-nom":         {fr:"Nom et Prénom complet *", en:"Full name *", ar:"الاسم الكامل *"},
        "adh-tel":         {fr:"Numéro de téléphone *", en:"Phone number *", ar:"رقم الهاتف *"},
        "adh-region":      {fr:"Adresse / Région / Ville *", en:"Address / Region *", ar:"العنوان / المنطقة *"},
        "adh-organe":      {fr:"Organe du Parti", en:"Party organ", ar:"هيئة الحزب"},
        "adh-poste":       {fr:"Poste occupé", en:"Position held", ar:"المنصب"},
        "abo-nom":         {fr:"Nom et Prénom *", en:"Full name *", ar:"الاسم الكامل *"},
        "abo-tel":         {fr:"Votre numéro de téléphone *", en:"Your phone number *", ar:"رقم هاتفك *"},
        "abo-ref":         {fr:"Numéro de référence de la transaction *", en:"Transaction reference number *", ar:"رقم مرجع المعاملة *"},
        "abo-ref":         {fr:"Numéro de référence de la transaction *", en:"Transaction reference number *", ar:"رقم مرجع المعاملة *"}
    };
    Object.keys(pls).forEach(function(id) {
        var el = document.getElementById(id);
        if (el && pls[id][lang]) el.placeholder = pls[id][lang];
    });

    /* Bouton publier */
    var btnPub = document.getElementById("bouton-publier");
    if (btnPub && !modeEdition && t["btn_publier"]) btnPub.textContent = t["btn_publier"];

    /* Prochains événements */
    var evTitre = document.querySelector(".widget-evenements-entete");
    if (evTitre && t["evenements_titre"]) evTitre.textContent = t["evenements_titre"];

    /* Accordéons menu — mettre à jour le texte SANS toucher au onclick */
    var accLabels = [
        {btn:"acc-langue", key:"menu_langue"},
        {btn:"acc-apparence", key:"menu_apparence"},
        {btn:"acc-taille", key:"menu_taille"}
    ];
    accLabels.forEach(function(item) {
        var el = document.getElementById(item.btn);
        if (!el || !t[item.key]) return;
        /* Trouver le nœud texte (pas l'icône span) et le mettre à jour */
        el.childNodes.forEach(function(node) {
            if (node.nodeType === 3 && node.textContent.trim()) {
                node.textContent = " " + t[item.key] + " ";
            }
        });
    });
}

document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        appliquerLangue(btn.dataset.lang);
        fermerMenuGauche();
    });
});

/* ================================================================
   4. STATUT & RI — MODAL
   ================================================================ */
function ouvrirModalStatutRI() {
    chargerStatutRI();
    document.getElementById("modal-statut-ri").style.display = "flex";
}
function fermerModalStatutRI() {
    document.getElementById("modal-statut-ri").style.display = "none";
}

document.getElementById("fermer-statut-ri").addEventListener("click", fermerModalStatutRI);
document.getElementById("modal-statut-ri").addEventListener("click", function(e) {
    if (e.target === this) fermerModalStatutRI();
});
document.getElementById("menu-btn-statut-ri").addEventListener("click", function() {
    fermerMenuGauche();
    ouvrirModalStatutRI();
});

function chargerStatutRI() {
    var zoneAdmin = document.getElementById("statut-ri-admin");
    var zoneDoc = document.getElementById("statut-ri-doc");
    var zoneVide = document.getElementById("statut-ri-vide");
    var btnSuppr = document.getElementById("btn-suppr-statut-ri");

    // Afficher zone admin si connecté
    if (zoneAdmin) zoneAdmin.style.display = estAdmin ? "block" : "none";

    // Charger le PDF existant
    var pdfData = localStorage.getItem("statutRIUndr");
    if (pdfData) {
        zoneVide.style.display = "none";
        var nomFichier = localStorage.getItem("statutRINomUndr") || "statut-ri-undr.pdf";
        zoneDoc.innerHTML =
            "<div class='pdf-nom'>📄 " + nomFichier + "</div>" +
            "<iframe src='" + pdfData + "' title='Statut & RI UNDR'></iframe>" +
            "<a href='" + pdfData + "' download='" + nomFichier + "' class='btn-retelecharger' style='display:inline-block;margin-top:8px;'>📥 Télécharger</a>";
        if (btnSuppr) btnSuppr.style.display = estAdmin ? "block" : "none";
    } else {
        zoneVide.style.display = "block";
        zoneDoc.innerHTML = "";
        if (btnSuppr) btnSuppr.style.display = "none";
    }
}

document.getElementById("btn-sauver-statut-ri").addEventListener("click", function() {
    var fichier = document.getElementById("statut-ri-fichier").files[0];
    if (!fichier) { alert("Merci de choisir un fichier PDF."); return; }
    if (fichier.type !== "application/pdf") { alert("Le fichier doit être au format PDF."); return; }
    if (fichier.size > 10 * 1024 * 1024) { alert("Fichier trop lourd (max 10 Mo)."); return; }
    var r = new FileReader();
    r.onload = function(e) {
        localStorage.setItem("statutRIUndr", e.target.result);
        localStorage.setItem("statutRINomUndr", fichier.name);
        document.getElementById("statut-ri-fichier").value = "";
        chargerStatutRI();
        alert("✅ Document enregistré !");
    };
    r.readAsDataURL(fichier);
});

document.getElementById("btn-suppr-statut-ri").addEventListener("click", function() {
    if (confirm("Supprimer le document Statut & RI ?")) {
        localStorage.removeItem("statutRIUndr");
        localStorage.removeItem("statutRINomUndr");
        chargerStatutRI();
    }
});

/* ================================================================
   INITIALISATION
   ================================================================ */
mettreAJourPointAdmin();
metAJourAffichageAdmin();
rafraichirPubs();
afficherArticles();
afficherEvenements();
setInterval(afficherEvenements, 5 * 60 * 1000); /* revérifie l'expiration toutes les 5 min */
ajusterEspaceEntete();
appliquerLangue(langueActuelle); /* Appliquer la langue sauvegardée */
setTimeout(demanderNotifications, 3000);



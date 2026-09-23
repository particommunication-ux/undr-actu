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
    if (estAdmin) { chargerAdhesionsAdmin(); chargerPubsAdmin(); }
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
document.getElementById("menu-btn-partager").addEventListener("click", function() { fermerMenuGauche(); partagerFacebook(window.location.href); });

/* ================================================================
   PAGE D'ACCUEIL (SPLASH)
   ================================================================ */
function fermerPageAccueil() {
    var pa = document.getElementById("page-accueil");
    var ac = document.getElementById("app-contenu");
    if (pa) pa.style.display = "none";
    if (ac) ac.style.display = "block";
    ajusterEspaceEntete();
}
var btnAccueilAccueil = document.getElementById("accueil-btn-accueil");
if (btnAccueilAccueil) btnAccueilAccueil.addEventListener("click", fermerPageAccueil);

var btnAccueilAdherer = document.getElementById("accueil-btn-adherer");
if (btnAccueilAdherer) btnAccueilAdherer.addEventListener("click", function() {
    fermerPageAccueil();
    ouvrirModalAdhesion();
});

var btnAccueilActus = document.getElementById("accueil-btn-actualites");
if (btnAccueilActus) btnAccueilActus.addEventListener("click", function() {
    fermerPageAccueil();
    var btnFiltreActus = document.querySelector('.filtre-btn[data-categorie="Actualités"]');
    if (btnFiltreActus) btnFiltreActus.click();
});

var btnAccueilContact = document.getElementById("accueil-btn-contact");
if (btnAccueilContact) btnAccueilContact.addEventListener("click", function() {
    fermerPageAccueil();
    setTimeout(function() {
        var pied = document.querySelector(".pied-de-page");
        if (pied) pied.scrollIntoView({ behavior: "smooth" });
    }, 150);
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

function afficherArticles() {
    conteneur.innerHTML = "";
    var liste = categorieActuelle === "Toutes"
        ? trierALaUne(articles)
        : articles.filter(function(a) { return a.categorie === categorieActuelle; });

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
                "<p class='date-article'>" + art.date + "</p>" +
            "</div>" +
            boutonsAdmin;

        conteneur.appendChild(div);
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
function genererPDF(d, photoDataUrl) {
    if (window.jspdf && window.jspdf.jsPDF) {
        try {
            var jsPDF = window.jspdf.jsPDF;
            var doc = new jsPDF({ unit:"mm", format:"a4" });
            doc.setFillColor(230,126,34); doc.rect(0,0,210,36,"F");
            doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont("helvetica","bold");
            doc.text("UNDR — Parti de l'Espoir", 105, 13, {align:"center"});
            doc.setFontSize(11); doc.setFont("helvetica","normal");
            doc.text("FICHE D'ADHÉSION", 105, 22, {align:"center"});
            doc.setFontSize(8);
            doc.text("Paix — Discipline — Travail", 105, 30, {align:"center"});
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
    var html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Adhésion " + d.id + "</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;}.entete{background:#003366;color:white;padding:18px;text-align:center;}.bande{height:5px;background:#e67e22;}.corps{padding:16px;display:flex;gap:16px;}.infos{flex:1;}.photo{width:105px;flex-shrink:0;}.cadre{width:100px;height:120px;border:2px solid #003366;overflow:hidden;}.num{background:#f0f4ff;padding:10px;border-radius:6px;margin-bottom:14px;font-size:13px;}.num strong{color:#003366;font-size:15px;}table{width:100%;border-collapse:collapse;margin-bottom:14px;}td{padding:6px 8px;font-size:12px;border-bottom:1px solid #eee;}td:first-child{font-weight:bold;color:#003366;width:40%;}.charte{background:#f8f9fa;padding:10px;border-radius:6px;font-size:11px;margin-bottom:14px;}.charte p{font-weight:bold;margin-bottom:4px;}.sigs{display:flex;gap:14px;}.sig{flex:1;background:#f0f4ff;padding:10px;border-radius:6px;font-size:11px;text-align:center;}.sl{border-top:1px solid #003366;margin-top:28px;padding-top:4px;color:#888;}.pied{background:#003366;color:white;padding:10px;text-align:center;font-size:10px;margin-top:16px;}@media print{.np{display:none;}}</style></head><body>";
    html += "<div class='np' style='background:#e67e22;color:white;padding:10px;text-align:center;'><button onclick='window.print()' style='background:white;color:#e67e22;border:none;padding:8px 20px;border-radius:20px;font-weight:bold;cursor:pointer;'>🖨️ Imprimer / Sauvegarder en PDF</button></div>";
    html += "<div class='entete'><h2>UNDR — Parti de l'Espoir</h2><p>FICHE D'ADHÉSION — Paix — Discipline — Travail</p></div><div class='bande'></div><div style='padding:16px;'><div class='num'>Dossier : <strong>" + d.id + "</strong> &nbsp; Date : " + d.date + "</div><div class='corps'><div class='infos'><table><tr><td>Nom et Prénom</td><td>" + d.nom + "</td></tr><tr><td>Date de naissance</td><td>" + d.naissance + "</td></tr><tr><td>Téléphone</td><td>" + d.tel + "</td></tr><tr><td>Région</td><td>" + d.region + "</td></tr><tr><td>Organe du Parti</td><td>" + (d.organe||"—") + "</td></tr><tr><td>Poste</td><td>" + (d.poste||"—") + "</td></tr></table></div><div class='photo'><div class='cadre'>" + photoHTML + "</div><p style='font-size:10px;color:#888;text-align:center;margin-top:4px;'>Photo d'identité</p></div></div><div class='charte'><p>Charte d'adhésion — En adhérant je m'engage à :</p><ul style='margin-left:14px;'><li>Respecter les statuts du parti</li><li>Contribuer aux activités du mouvement</li><li>Défendre les valeurs de démocratie</li><li>Payer la cotisation annuelle</li></ul></div><div class='sigs'><div class='sig'>Signature du membre<div class='sl'></div></div><div class='sig'>Visa du responsable<div class='sl'></div></div></div></div><div class='pied'>UNDR — +235 66 79 77 51 — Document généré le " + d.date + "</div><script>setTimeout(function(){window.print();},600);</scr" + "ipt></body></html>";
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
        /* Chat */
        "chat_titre": "Chat en direct", "btn_envoyer_chat": "Envoyer",
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
        "chat_titre": "Live Chat", "btn_envoyer_chat": "Send",
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
        "chat_titre": "دردشة مباشرة", "btn_envoyer_chat": "إرسال",
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
        "chat-pseudo":     {fr:"Votre nom", en:"Your name", ar:"اسمك"},
        "chat-message":    {fr:"Votre message", en:"Your message", ar:"رسالتك"}
    };
    Object.keys(pls).forEach(function(id) {
        var el = document.getElementById(id);
        if (el && pls[id][lang]) el.placeholder = pls[id][lang];
    });

    /* Bouton publier */
    var btnPub = document.getElementById("bouton-publier");
    if (btnPub && !modeEdition && t["btn_publier"]) btnPub.textContent = t["btn_publier"];

    /* Chat */
    var chatTitre = document.querySelector(".chat-box h2");
    if (chatTitre && t["chat_titre"]) chatTitre.textContent = t["chat_titre"];
    var btnEnvoyer = document.getElementById("chat-envoyer");
    if (btnEnvoyer && t["btn_envoyer_chat"]) btnEnvoyer.textContent = t["btn_envoyer_chat"];

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
ajusterEspaceEntete();
appliquerLangue(langueActuelle); /* Appliquer la langue sauvegardée */
setTimeout(demanderNotifications, 3000);



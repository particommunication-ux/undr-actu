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
        new Notification("📰 UNDR Actualités", { body: "Nouvel article : " + titre, icon: "./logo.png" });
    }
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
    if (estAdmin) { chargerAdhesionsAdmin(); chargerAbonnesAdmin(); chargerPubsAdmin(); }
    var vues = document.getElementById("detail-vues");
    if (vues) vues.style.display = estAdmin ? "block" : "none";
    var btnPart = document.getElementById("btn-partager-article");
    if (btnPart) btnPart.style.display = estAdmin ? "inline-flex" : "none";
    afficherBoutonPremiumAdmin();
}

/* ================================================================
   ABONNEMENT
   ================================================================ */
function mettreAJourBandeauAbo() {
    var b = document.getElementById("bandeau-abonnement");
    if (b) b.style.display = (!estAbonne && !estAdmin) ? "block" : "none";
    ajusterEspaceEntete();
    var s = document.getElementById("statut-abonnement-panneau");
    if (!s) return;
    if (estAbonne) {
        s.innerHTML = "<div class='statut-abo actif'>💎 Abonnement actif</div><button id='btn-resil-abo' class='btn-resilier'>Se désabonner</button>";
        document.getElementById("btn-resil-abo").addEventListener("click", function() {
            if (confirm("Voulez-vous vous désabonner ?")) {
                localStorage.removeItem("abonneUNDR");
                estAbonne = false;
                mettreAJourBandeauAbo();
                afficherArticles();
            }
        });
    } else {
        s.innerHTML = "<div class='statut-abo inactif'>🔒 Pas d'abonnement actif</div><button class='btn-payer' id='btn-abo-panneau' style='margin-top:8px;width:100%;'>S'abonner — 1 000 FCFA/mois</button>";
        document.getElementById("btn-abo-panneau").addEventListener("click", function() {
            fermerMenuGauche();
            ouvrirModalAbonnement();
        });
    }
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
document.getElementById("menu-btn-adherer").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalAdhesion(); });
document.getElementById("menu-btn-abonner").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalAbonnement(); });
document.getElementById("menu-btn-partager").addEventListener("click", function() { fermerMenuGauche(); partagerFacebook(window.location.href); });

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
            "<img src='" + img + "' class='article-img" + (verr ? " img-floue" : "") + "' alt='" + art.titre + "'>" +
            (verr ? "<div class='carte-verrou-overlay'><span>🔒</span><small>Abonnez-vous</small></div>" : "") +
            "<span class='badge'>" + art.categorie + "</span>" +
            (premium ? "<span class='badge-premium'>🔒 Premium</span>" : "") +
            badgeUne +
            "<h2>" + art.titre + "</h2>" +
            "<p class='date-article'>" + art.date + "</p>" +
            btnPartager +
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
    document.getElementById("verrou-premium").style.display = verr ? "flex" : "none";

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
document.getElementById("btn-abo-verrou").addEventListener("click", ouvrirModalAbonnement);
document.getElementById("bandeau-btn-adherer").addEventListener("click", ouvrirModalAdhesion);
document.getElementById("bandeau-btn-abo").addEventListener("click", ouvrirModalAbonnement);

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
        document.getElementById("article-premium").checked = art.premium === true;
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
        if (art && estPremiumEffectif(art) && !estAbonne && !estAdmin) { ouvrirModalAbonnement(); return; }
        if (art) ouvrirArticle(id);
    }
});

/* APERÇU IMAGE ET VIDÉO ADMIN */
document.getElementById("nouvelle-image").addEventListener("change", function() {
    var f = this.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function(e) { document.getElementById("apercu-image-admin").innerHTML = "<img src='" + e.target.result + "' style='max-height:80px;border-radius:6px;'>"; };
    r.readAsDataURL(f);
});
document.getElementById("nouvelle-video-fichier").addEventListener("change", function() {
    var f = this.files[0]; if (!f) return;
    if (f.size > 50*1024*1024) { alert("Vidéo trop lourde. Maximum 50 Mo."); this.value = ""; return; }
    var r = new FileReader();
    r.onload = function(e) {
        videoFichierData = e.target.result;
        document.getElementById("apercu-video-admin").innerHTML = "<video src='" + e.target.result + "' style='max-height:100px;border-radius:6px;' controls></video>";
    };
    r.readAsDataURL(f);
});

/* PUBLIER / MODIFIER */
document.getElementById("bouton-publier").addEventListener("click", function() {
    var titre = document.getElementById("nouveau-titre").value.trim();
    var contenu = document.getElementById("editeur-contenu").innerHTML.trim();
    if (!titre || !contenu) { alert("Merci de remplir le titre et le contenu."); return; }

    function sauver(imgData) {
        var obj = {
            titre: titre, contenu: contenu,
            categorie: document.getElementById("nouvelle-categorie").value,
            video: document.getElementById("nouvelle-video").value.trim(),
            videoFichier: videoFichierData || "",
            premium: document.getElementById("article-premium").checked,
            image: imgData || ""
        };
        if (modeEdition && idEdition !== null) {
            var idx = articles.findIndex(function(a) { return a.id === idEdition; });
            if (idx !== -1) { obj.importance = articles[idx].importance || 0; Object.assign(articles[idx], obj); }
            modeEdition = false; idEdition = null;
            document.getElementById("bouton-publier").textContent = "Publier";
        } else {
            obj.id = Date.now();
            obj.date = new Date().toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric"});
            obj.importance = 2;
            articles.unshift(obj);
            envoyerNotifLocale(titre);
        }
        localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        document.getElementById("nouveau-titre").value = "";
        document.getElementById("editeur-contenu").innerHTML = "";
        document.getElementById("nouvelle-video").value = "";
        document.getElementById("nouvelle-image").value = "";
        document.getElementById("nouvelle-video-fichier").value = "";
        document.getElementById("apercu-image-admin").innerHTML = "";
        document.getElementById("apercu-video-admin").innerHTML = "";
        document.getElementById("article-premium").checked = false;
        videoFichierData = null;
        afficherArticles();
        alert("✅ Article publié !");
    }

    var fi = document.getElementById("nouvelle-image").files[0];
    if (fi) { var r = new FileReader(); r.onload = function(e) { sauver(e.target.result); }; r.readAsDataURL(fi); }
    else {
        var artEx = modeEdition && idEdition ? articles.find(function(a) { return a.id === idEdition; }) : null;
        sauver(artEx ? artEx.image : null);
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
    if (f.size > 2*1024*1024) { alert("Photo trop lourde (max 2 Mo)."); this.value = ""; return; }
    var r = new FileReader();
    r.onload = function(e) { document.getElementById("apercu-photo").innerHTML = "<img src='" + e.target.result + "' style='max-width:100%;max-height:110px;border-radius:6px;margin-top:6px;'>"; };
    r.readAsDataURL(f);
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
    if (!document.getElementById("adh-accord").checked) { alert("Vous devez accepter la charte de l'UNDR."); return; }
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

    if (photoFile) { var r = new FileReader(); r.onload = function(e) { finaliser(e.target.result); }; r.readAsDataURL(photoFile); }
    else finaliser(null);
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
   4. MODAL ABONNEMENT — PAR RÉFÉRENCE DE TRANSACTION
   ================================================================ */
function afficherEtapePaiement(num) {
    ["1","2","erreur"].forEach(function(n) {
        var el = document.getElementById(n === "erreur" ? "etape-paiement-erreur" : "etape-paiement-" + n);
        if (el) el.style.display = "none";
    });
    var cible = document.getElementById(num === "erreur" ? "etape-paiement-erreur" : "etape-paiement-" + num);
    if (cible) cible.style.display = "block";
}

function ouvrirModalAbonnement() {
    afficherEtapePaiement("1");
    ["abo-nom","abo-tel","abo-ref"].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ""; });
    document.getElementById("abo-operateur").value = "";
    document.getElementById("modal-abonnement").style.display = "flex";
}
function fermerModalAbonnement() { document.getElementById("modal-abonnement").style.display = "none"; }
document.getElementById("fermer-abonnement").addEventListener("click", fermerModalAbonnement);
document.getElementById("modal-abonnement").addEventListener("click", function(e) { if (e.target === this) fermerModalAbonnement(); });
document.getElementById("btn-reessayer").addEventListener("click", function() { afficherEtapePaiement("1"); });

document.getElementById("btn-confirmer-abo").addEventListener("click", function() {
    var nom = document.getElementById("abo-nom").value.trim();
    var tel = document.getElementById("abo-tel").value.trim();
    var op  = document.getElementById("abo-operateur").value;
    var ref = document.getElementById("abo-ref").value.trim();
    if (!nom || !tel || !op || !ref) {
        document.getElementById("msg-erreur-paiement").textContent = "Merci de remplir tous les champs, y compris le numéro de référence.";
        afficherEtapePaiement("erreur");
        return;
    }
    /* Activer l'abonnement immédiatement */
    estAbonne = true;
    localStorage.setItem("abonneUNDR", "true");
    localStorage.setItem("abonneTelUNDR", tel);
    var ab = JSON.parse(localStorage.getItem("abonnesUNDR") || "[]");
    ab.push({ nom:nom, tel:tel, operateur:op, ref:ref, date:new Date().toLocaleDateString("fr-FR"), statut:"Validé" });
    localStorage.setItem("abonnesUNDR", JSON.stringify(ab));
    if (window.db) {
        window.db.collection("abonnements").add({ nom:nom, tel:tel, operateur:op, ref:ref, date:firebase.firestore.FieldValue.serverTimestamp(), statut:"Validé" }).catch(function(){});
    }
    document.getElementById("ref-confirmee").textContent = ref;
    afficherEtapePaiement("2");
});

document.getElementById("fermer-succes-abo").addEventListener("click", function() {
    fermerModalAbonnement();
    mettreAJourBandeauAbo();
    afficherArticles();
    alert("🎉 Bienvenue ! Vous avez maintenant accès à tous les contenus UNDR.");
});

/* ================================================================
   3. MODE ABONNEMENT — BOUTON ADMIN POUR DÉSACTIVER
   ================================================================ */
var modeAbonnementActif = localStorage.getItem("premiumDesactiveUNDR") !== "true";

function afficherBoutonPremiumAdmin() {
    var zone = document.getElementById("btn-premium-admin");
    if (!zone || !estAdmin) return;
    zone.style.display = "block";
    zone.innerHTML = modeAbonnementActif
        ? "<button id='btn-toggle-premium' class='btn-premium-on'>🔒 Premium activé — Cliquer pour désactiver</button>"
        : "<button id='btn-toggle-premium' class='btn-premium-off'>🔓 Premium désactivé — Cliquer pour réactiver</button>";
    document.getElementById("btn-toggle-premium").addEventListener("click", function() {
        modeAbonnementActif = !modeAbonnementActif;
        localStorage.setItem("premiumDesactiveUNDR", modeAbonnementActif ? "false" : "true");
        // Si désactivé : tous les articles sont accessibles sans abonnement
        afficherBoutonPremiumAdmin();
        afficherArticles();
        alert(modeAbonnementActif ? "✅ Mode Premium réactivé." : "🔓 Mode Premium désactivé. Tous les articles sont maintenant accessibles.");
    });
}

// Surcharger estPremium pour tenir compte du mode désactivé
function estPremiumEffectif(art) {
    if (!modeAbonnementActif) return false; // Premium désactivé par admin
    return art.premium === true || CATEGORIES_PREMIUM.includes(art.categorie);
}

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
function chargerAbonnesAdmin() {
    var zone = document.getElementById("liste-abonnes"); if (!zone) return;
    var ab = JSON.parse(localStorage.getItem("abonnesUNDR") || "[]");
    if (!ab.length) { zone.innerHTML = "<p style='color:#888;font-size:13px;'>Aucun abonné.</p>"; return; }
    zone.innerHTML = ab.map(function(a, i) {
        return "<div class='adhesion-item'><strong>" + a.nom + "</strong> — " + a.operateur + " — 📞 " + a.tel + "<br>" +
            "<small>Réf: " + (a.ref||a.txId||"—") + " | " + a.date + "</small><br>" +
            "<span class='badge-statut " + (a.statut==="Validé"?"valide":"attente") + "'>" + a.statut + "</span>" +
            "<button class='btn-suppr-abo' data-index='" + i + "'>🗑</button></div>";
    }).join("");
    zone.querySelectorAll(".btn-suppr-abo").forEach(function(b) {
        b.addEventListener("click", function() {
            var a = JSON.parse(localStorage.getItem("abonnesUNDR")||"[]");
            a.splice(Number(b.dataset.index),1);
            localStorage.setItem("abonnesUNDR", JSON.stringify(a)); chargerAbonnesAdmin();
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

/* LANGUE */
var langueActuelle = localStorage.getItem("langueUNDR") || "fr";
document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        langueActuelle = btn.dataset.lang;
        localStorage.setItem("langueUNDR", langueActuelle);
        document.documentElement.lang = langueActuelle;
        document.documentElement.dir = langueActuelle === "ar" ? "rtl" : "ltr";
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
mettreAJourBandeauAbo();
mettreAJourPointAdmin();
metAJourAffichageAdmin();
rafraichirPubs();
afficherArticles();
ajusterEspaceEntete();
setTimeout(demanderNotifications, 3000);



/* ============================================================
   UNDR Actualités — script.js — Version complète corrigée
   6 corrections : notifications, À la une, PDF adhésion,
   abonnement actif immédiat, partage Facebook, vues visibles
   ============================================================ */

const MOT_DE_PASSE_ADMIN = "undr2026";
let estAdmin = sessionStorage.getItem("adminUNDR") === "true";
let estAbonne = localStorage.getItem("abonneUNDR") === "true";
const CATEGORIES_PREMIUM = ["Actualités","Communiqués","Actualités Tchad","Actualités Politique","Divertissement"];

/* ============================================================
   TRADUCTIONS fr / en / ar
   ============================================================ */
const T = {
    fr:{
        menu_adherer:"Adhérer à l'UNDR",menu_abonner:"S'abonner",menu_partager:"Partager l'application",
        menu_langue:"Langue",menu_apparence:"Apparence",menu_sombre:"Mode sombre",menu_taille:"Taille du texte",
        bandeau_texte:"Contenu réservé aux abonnés",btn_adherer:"Adhérer",btn_abonner:"S'abonner",
        cat_toutes:"À la Une",cat_actu:"Actualités",cat_activ:"Activités",cat_com:"Communiqués",
        cat_bne:"Portraits BNE",cat_tchad:"Tchad",cat_pol:"Politique",cat_div:"Divertissement",
        form_titre:"Ajouter un article",btn_retour:"Retour",btn_partager_art:"Partager sur Facebook",
        verrou_titre:"Contenu réservé aux abonnés",verrou_texte:"Abonnez-vous pour accéder à l'intégralité.",
        btn_abo_verrou:"S'abonner — 1 000 FCFA/mois",adh_titre:"Adhérer à l'UNDR",
        adh_sous:"Rejoignez le mouvement pour l'espoir et le renouveau du Tchad",
        adh_identite:"Votre identité",adh_naissance:"Date de naissance *",adh_photo:"Photo d'identité * (max 2 Mo)",
        adh_confirm:"Confirmation",adh_succes:"Demande envoyée !",adh_succes_texte:"Un responsable vous contactera sous 48h.",
        charte_titre:"En adhérant à l'UNDR, je m'engage à :",
        charte_1:"Respecter les statuts et règlements du parti",
        charte_2:"Contribuer activement aux activités du mouvement",
        charte_3:"Défendre les valeurs de démocratie et de développement",
        charte_4:"Payer la cotisation annuelle fixée par la direction",
        charte_accord:"J'accepte la charte et les statuts de l'UNDR",
        btn_suivant:"Suivant →",btn_retour_f:"← Retour",btn_soumettre:"✅ Soumettre",btn_fermer:"Fermer",
        abo_titre:"Abonnement Premium",abo_sous:"Accédez à tous les contenus exclusifs de l'UNDR",
        abo_av1:"Tous les articles sans restriction",abo_av2:"Actualités politiques exclusives",
        abo_av3:"Communiqués officiels complets",abo_av4:"Divertissement & contenus spéciaux",
        paiement_coords:"Vos coordonnées",paiement_choisir:"Choisir l'opérateur",btn_payer:"Payer 1 000 FCFA",
        paiement_attente:"Vérifiez votre téléphone !",
        paiement_attente_texte:"Une demande a été envoyée sur votre numéro. Entrez votre code PIN pour confirmer 1 000 FCFA.",
        paiement_ne_quittez:"Ne quittez pas cette page...",btn_annuler:"Annuler",
        paiement_succes:"Abonnement activé !",paiement_succes_texte:"Vous avez maintenant accès à tous les contenus. Bonne lecture !",
        paiement_echec:"Paiement non confirmé",paiement_echec_texte:"Vérifiez votre solde et réessayez.",
        btn_reessayer:"Réessayer",chat_titre:"Chat en direct",btn_envoyer:"Envoyer",
        btn_direct:"Suivre le Direct",lire_aussi:"Lire aussi",
        notif_demande:"Recevoir les notifications ?",notif_btn:"Oui, activer",notif_non:"Non merci"
    },
    en:{
        menu_adherer:"Join UNDR",menu_abonner:"Subscribe",menu_partager:"Share the app",
        menu_langue:"Language",menu_apparence:"Appearance",menu_sombre:"Dark mode",menu_taille:"Text size",
        bandeau_texte:"Content for subscribers only",btn_adherer:"Join",btn_abonner:"Subscribe",
        cat_toutes:"Top Stories",cat_actu:"News",cat_activ:"Activities",cat_com:"Press releases",
        cat_bne:"BNE Portraits",cat_tchad:"Chad",cat_pol:"Politics",cat_div:"Entertainment",
        form_titre:"Add an article",btn_retour:"Back",btn_partager_art:"Share on Facebook",
        verrou_titre:"Subscribers only",verrou_texte:"Subscribe to read the full article.",
        btn_abo_verrou:"Subscribe — 1,000 FCFA/month",adh_titre:"Join UNDR",
        adh_sous:"Join the movement for hope and renewal of Chad",
        adh_identite:"Your identity",adh_naissance:"Date of birth *",adh_photo:"ID photo * (max 2 MB)",
        adh_confirm:"Confirmation",adh_succes:"Request sent!",adh_succes_texte:"A representative will contact you within 48h.",
        charte_titre:"By joining UNDR, I commit to:",
        charte_1:"Respect the party's statutes",charte_2:"Actively contribute to the movement",
        charte_3:"Defend democracy and development values",charte_4:"Pay the annual membership fee",
        charte_accord:"I accept the UNDR charter and statutes",
        btn_suivant:"Next →",btn_retour_f:"← Back",btn_soumettre:"✅ Submit",btn_fermer:"Close",
        abo_titre:"Premium Subscription",abo_sous:"Access all exclusive UNDR content",
        abo_av1:"All articles without restriction",abo_av2:"Exclusive political news",
        abo_av3:"Full official press releases",abo_av4:"Entertainment & special content",
        paiement_coords:"Your details",paiement_choisir:"Choose operator",btn_payer:"Pay 1,000 FCFA",
        paiement_attente:"Check your phone!",
        paiement_attente_texte:"A request was sent to your number. Enter your PIN to confirm 1,000 FCFA.",
        paiement_ne_quittez:"Do not leave this page...",btn_annuler:"Cancel",
        paiement_succes:"Subscription activated!",paiement_succes_texte:"You now have full access. Enjoy reading!",
        paiement_echec:"Payment not confirmed",paiement_echec_texte:"Check your balance and try again.",
        btn_reessayer:"Try again",chat_titre:"Live Chat",btn_envoyer:"Send",
        btn_direct:"Watch Live",lire_aussi:"Read also",
        notif_demande:"Receive notifications?",notif_btn:"Yes, enable",notif_non:"No thanks"
    },
    ar:{
        menu_adherer:"الانضمام إلى UNDR",menu_abonner:"الاشتراك",menu_partager:"مشاركة التطبيق",
        menu_langue:"اللغة",menu_apparence:"المظهر",menu_sombre:"الوضع المظلم",menu_taille:"حجم الخط",
        bandeau_texte:"محتوى مخصص للمشتركين",btn_adherer:"انضم",btn_abonner:"اشترك",
        cat_toutes:"الأبرز",cat_actu:"أخبار",cat_activ:"أنشطة",cat_com:"بيانات",
        cat_bne:"صور المكتب",cat_tchad:"تشاد",cat_pol:"سياسة",cat_div:"ترفيه",
        form_titre:"إضافة مقال",btn_retour:"رجوع",btn_partager_art:"مشاركة على فيسبوك",
        verrou_titre:"محتوى للمشتركين فقط",verrou_texte:"اشترك للوصول إلى المقال كاملاً.",
        btn_abo_verrou:"اشترك — 1 000 فرنك/شهر",adh_titre:"الانضمام إلى UNDR",
        adh_sous:"انضم إلى حركة الأمل وتجديد تشاد",
        adh_identite:"هويتك",adh_naissance:"تاريخ الميلاد *",adh_photo:"صورة الهوية * (أقصى 2 ميغا)",
        adh_confirm:"تأكيد",adh_succes:"تم إرسال الطلب!",adh_succes_texte:"سيتصل بك مسؤول UNDR خلال 48 ساعة.",
        charte_titre:"بانضمامي إلى UNDR، أتعهد بـ:",
        charte_1:"احترام النظام الأساسي للحزب",charte_2:"المشاركة الفعالة في أنشطة الحركة",
        charte_3:"الدفاع عن قيم الديمقراطية والتنمية",charte_4:"دفع الاشتراك السنوي",
        charte_accord:"أوافق على ميثاق UNDR",
        btn_suivant:"التالي ←",btn_retour_f:"رجوع →",btn_soumettre:"✅ إرسال",btn_fermer:"إغلاق",
        abo_titre:"اشتراك مميز",abo_sous:"الوصول إلى جميع محتويات UNDR",
        abo_av1:"جميع المقالات",abo_av2:"أخبار سياسية حصرية",
        abo_av3:"بيانات رسمية كاملة",abo_av4:"ترفيه ومحتوى خاص",
        paiement_coords:"بياناتك",paiement_choisir:"اختر المشغل",btn_payer:"دفع 1 000 فرنك",
        paiement_attente:"تحقق من هاتفك!",
        paiement_attente_texte:"تم إرسال طلب إلى رقمك. أدخل رمز PIN لتأكيد الدفع.",
        paiement_ne_quittez:"لا تغادر هذه الصفحة...",btn_annuler:"إلغاء",
        paiement_succes:"تم تفعيل الاشتراك!",paiement_succes_texte:"يمكنك الآن قراءة جميع المحتويات.",
        paiement_echec:"لم يتم تأكيد الدفع",paiement_echec_texte:"تحقق من رصيدك وحاول مجدداً.",
        btn_reessayer:"حاول مجدداً",chat_titre:"دردشة مباشرة",btn_envoyer:"إرسال",
        btn_direct:"متابعة البث",lire_aussi:"اقرأ أيضاً",
        notif_demande:"تلقي الإشعارات؟",notif_btn:"نعم، تفعيل",notif_non:"لا شكراً"
    }
};

let langueActuelle = localStorage.getItem("langueUNDR") || "fr";

function appliquerLangue(lang) {
    langueActuelle = lang;
    localStorage.setItem("langueUNDR", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function(el) {
        const cle = el.getAttribute("data-i18n");
        if (T[lang] && T[lang][cle]) el.textContent = T[lang][cle];
    });
    const pls = {
        "adh-nom":{fr:"Nom et Prénom *",en:"Full name *",ar:"الاسم الكامل *"},
        "adh-tel":{fr:"Numéro de téléphone *",en:"Phone number *",ar:"رقم الهاتف *"},
        "adh-region":{fr:"Adresse / Région / Ville *",en:"Address / Region *",ar:"العنوان / المنطقة *"},
        "adh-organe":{fr:"Organe du Parti",en:"Party organ",ar:"هيئة الحزب"},
        "adh-poste":{fr:"Poste occupé",en:"Position held",ar:"المنصب"},
        "abo-nom":{fr:"Nom et Prénom *",en:"Full name *",ar:"الاسم الكامل *"},
        "abo-tel":{fr:"Numéro Mobile Money *",en:"Mobile Money number *",ar:"رقم Mobile Money *"},
        "chat-pseudo":{fr:"Votre nom",en:"Your name",ar:"اسمك"},
        "chat-message":{fr:"Votre message",en:"Your message",ar:"رسالتك"},
        "nouveau-titre":{fr:"Titre de l'article",en:"Article title",ar:"عنوان المقال"}
    };
    Object.keys(pls).forEach(function(id) {
        const el = document.getElementById(id);
        if (el && pls[id][lang]) el.placeholder = pls[id][lang];
    });
}
document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.addEventListener("click", function() { appliquerLangue(btn.dataset.lang); });
});

/* ============================================================
   1. NOTIFICATIONS PUSH
   ============================================================ */
function demanderNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") return; // déjà accordé
    if (localStorage.getItem("notifRefuseeUNDR") === "true") return; // déjà refusé

    // Afficher la bannière personnalisée (pas le popup natif direct)
    const banniere = document.getElementById("banniere-notif");
    if (banniere) banniere.style.display = "flex";
}

function activerNotifications() {
    document.getElementById("banniere-notif").style.display = "none";
    Notification.requestPermission().then(function(perm) {
        if (perm === "granted") {
            abonnerAuxNotifications();
            alert("✅ Notifications activées ! Vous recevrez les nouvelles publications.");
        }
    });
}

function abonnerAuxNotifications() {
    navigator.serviceWorker.ready.then(function(sw) {
        sw.pushManager.subscribe({
            userVisibleOnly: true,
            // Clé VAPID publique — générez la vôtre sur https://vapidkeys.com
            // et remplacez la valeur ci-dessous
            applicationServerKey: urlBase64ToUint8Array(
                "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZJDy"
            )
        }).then(function(sub) {
            // Envoyer la souscription à Firebase pour la stocker
            if (window.db) {
                window.db.collection("push_subscriptions").add({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")))),
                        auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth"))))
                    },
                    date: new Date().toISOString()
                }).catch(function() {});
            }
            localStorage.setItem("notifActiveUNDR", "true");
        }).catch(function() {});
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(function(c) { return c.charCodeAt(0); }));
}

// Envoyer une notification locale quand un article est publié (admin)
function envoyerNotifLocale(titre) {
    if (Notification.permission === "granted") {
        new Notification("📰 UNDR Actualités", {
            body: "Nouvel article : " + titre,
            icon: "./logo.png",
            badge: "./logo.png"
        });
    }
}

/* ============================================================
   ARTICLES
   ============================================================ */
const articlesParDefaut = [
    {id:1,titre:"Session parlementaire ouverte",date:"20 juillet 2026",contenu:"Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.",categorie:"Actualités",image:"",video:"",videoFichier:"",premium:true,importance:3},
    {id:2,titre:"Visite de terrain dans la région Nord",date:"15 juillet 2026",contenu:"Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.",categorie:"Activités",image:"",video:"",videoFichier:"",premium:false,importance:2},
    {id:3,titre:"Déclaration officielle du groupe",date:"10 juillet 2026",contenu:"Le groupe a publié une déclaration concernant les récents débats budgétaires.",categorie:"Communiqués",image:"",video:"",videoFichier:"",premium:true,importance:1}
];

let articles = JSON.parse(localStorage.getItem("articlesUNDR")) || articlesParDefaut;
let categorieActuelle = "Toutes";
let modeEdition = false;
let idEdition = null;
let videoFichierData = null;
let derniereDemande = null;

const conteneur = document.getElementById("liste-articles");
const boutonsFiltre = document.querySelectorAll(".filtre-btn");

function estPremium(art) { return art.premium === true || CATEGORIES_PREMIUM.includes(art.categorie); }

/* ============================================================
   ADMIN SECRET — POINT ORANGE
   ============================================================ */
function mettreAJourPointAdmin() {
    const p = document.getElementById("point-admin");
    if (!p) return;
    p.style.color = estAdmin ? "#e63946" : "#e67e22";
}

document.getElementById("point-admin").addEventListener("click", function(e) {
    e.stopPropagation();
    if (estAdmin) {
        if (confirm("Quitter le mode administration ?")) {
            estAdmin = false; sessionStorage.removeItem("adminUNDR");
            mettreAJourPointAdmin(); metAJourAffichageAdmin(); afficherArticles();
        }
    } else {
        const s = prompt("Mot de passe administrateur :");
        if (s === MOT_DE_PASSE_ADMIN) {
            estAdmin = true; sessionStorage.setItem("adminUNDR", "true");
            alert("✅ Mode admin activé.");
        } else if (s !== null) { alert("❌ Mot de passe incorrect."); }
        mettreAJourPointAdmin(); metAJourAffichageAdmin(); afficherArticles();
    }
});

function metAJourAffichageAdmin() {
    const f = document.getElementById("formulaire-ajout");
    if (f) f.style.display = estAdmin ? "block" : "none";
    if (estAdmin) { chargerAdhesionsAdmin(); chargerAbonnesAdmin(); chargerPubsAdmin(); }
    // Vues : recharger si on est dans la vue détail
    const vuesEl = document.getElementById("detail-vues");
    if (vuesEl) vuesEl.style.display = estAdmin ? "block" : "none";
}

/* ============================================================
   ABONNEMENT — BANDEAU ET STATUT
   ============================================================ */
function mettreAJourBandeauAbo() {
    const b = document.getElementById("bandeau-abonnement");
    if (b) b.style.display = (!estAbonne && !estAdmin) ? "block" : "none";
    const s = document.getElementById("statut-abonnement-panneau");
    if (!s) return;
    if (estAbonne) {
        s.innerHTML = `<div class="statut-abo actif">💎 Abonnement actif</div>
            <button id="btn-resil-abo" class="btn-resilier">Se désabonner</button>`;
        document.getElementById("btn-resil-abo").addEventListener("click", function() {
            if (confirm("Voulez-vous vous désabonner ?")) {
                localStorage.removeItem("abonneUNDR"); estAbonne = false;
                mettreAJourBandeauAbo(); afficherArticles();
            }
        });
    } else {
        s.innerHTML = `<div class="statut-abo inactif">🔒 Pas d'abonnement actif</div>
            <button class="btn-payer" id="btn-abo-panneau" style="margin-top:8px;width:100%;">S'abonner — 1 000 FCFA/mois</button>`;
        document.getElementById("btn-abo-panneau").addEventListener("click", function() {
            fermerMenuGauche(); ouvrirModalAbonnement();
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

// Accordéons du menu gauche
["acc-langue","acc-apparence","acc-taille"].forEach(function(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const cible = document.getElementById("contenu-" + id.replace("acc-",""));
    btn.addEventListener("click", function() {
        const ouvert = cible.style.display !== "none";
        cible.style.display = ouvert ? "none" : "block";
        btn.querySelector(".accordeon-icone").textContent = ouvert ? "▾" : "▴";
    });
});
document.getElementById("menu-btn-adherer").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalAdhesion(); });
document.getElementById("menu-btn-abonner").addEventListener("click", function() { fermerMenuGauche(); ouvrirModalAbonnement(); });
document.getElementById("menu-btn-partager").addEventListener("click", function() { fermerMenuGauche(); partagerFacebook(window.location.href); });

/* ============================================================
   5. PARTAGE FACEBOOK DIRECT
   ============================================================ */
function partagerFacebook(url) {
    const fbUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    window.open(fbUrl, "_blank", "width=600,height=400,noopener");
}

/* ============================================================
   2. AFFICHAGE "À LA UNE" — tri par importance puis date
   ============================================================ */
function trierALaUne(liste) {
    return liste.slice().sort(function(a, b) {
        const ia = a.importance || 0;
        const ib = b.importance || 0;
        if (ib !== ia) return ib - ia;
        return b.id - a.id; // plus récent en premier
    });
}

function afficherArticles() {
    conteneur.innerHTML = "";
    let liste;
    if (categorieActuelle === "Toutes") {
        liste = trierALaUne(articles);
    } else {
        liste = articles.filter(function(a) { return a.categorie === categorieActuelle; });
    }

    liste.forEach(function(art, i) {
        const div = document.createElement("div");
        const premium = estPremium(art);
        const verr = premium && !estAbonne && !estAdmin;
        div.className = i === 0 ? "article une" : "article";
        if (verr) div.classList.add("article-verrou");
        div.dataset.id = art.id;
        const img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");

        div.innerHTML = `
            <img src="${img}" class="article-img${verr?" img-floue":""}" alt="${art.titre}">
            ${verr?`<div class="carte-verrou-overlay"><span>🔒</span><small>Abonnez-vous</small></div>`:""}
            <span class="badge">${art.categorie}</span>
            ${premium?`<span class="badge-premium">🔒 Premium</span>`:""}
            ${(i===0 && estAdmin)?`<span class="badge-une">⭐ À la Une</span>`:""}
            <h2>${art.titre}</h2>
            <p class="date-article">${art.date}</p>
            ${estAdmin?`<button class="btn-partager-carte" data-id="${art.id}" title="Partager sur Facebook">📘</button>`:""}
            ${estAdmin?`<div class="admin-carte-btns">
                <button class="btn-modifier" data-id="${art.id}">✏️ Modifier</button>
                <button class="btn-supprimer" data-id="${art.id}">🗑 Supprimer</button>
                <select class="select-importance" data-id="${art.id}" title="Importance">
                    <option value="0" ${!art.importance||art.importance===0?"selected":""}>Normale</option>
                    <option value="1" ${art.importance===1?"selected":""}>⭐ Importante</option>
                    <option value="2" ${art.importance===2?"selected":""}>⭐⭐ Très importante</option>
                    <option value="3" ${art.importance===3?"selected":""}>⭐⭐⭐ À la une</option>
                </select>
            </div>`:""}
        `;
        conteneur.appendChild(div);
    });

    // Gérer changement d'importance admin
    conteneur.querySelectorAll(".select-importance").forEach(function(sel) {
        sel.addEventListener("change", function() {
            const id = Number(sel.dataset.id);
            const idx = articles.findIndex(function(a) { return a.id === id; });
            if (idx !== -1) {
                articles[idx].importance = Number(sel.value);
                localStorage.setItem("articlesUNDR", JSON.stringify(articles));
                afficherArticles();
            }
        });
    });
}

/* ============================================================
   6. VUES FIREBASE — VISIBLES PAR TOUS EN DÉTAIL, ADMIN SEUL
   ============================================================ */
function incrementerVue(id) {
    if (!window.db) return;
    const ref = window.db.collection("vues").doc(String(id));
    ref.get().then(function(doc) {
        ref.set({ compte: (doc.exists ? doc.data().compte : 0) + 1 });
    }).catch(function() {});
}

function afficherVue(id) {
    const el = document.getElementById("detail-vues");
    if (!el) return;

    // Affichage immédiat depuis localStorage en attendant Firebase
    const cacheKey = "vues_" + id;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        el.textContent = "👁 " + cached + (Number(cached) > 1 ? " vues" : " vue");
        el.style.display = estAdmin ? "block" : "none";
    }

    if (!window.db) {
        el.style.display = estAdmin ? "block" : "none";
        return;
    }
    window.db.collection("vues").doc(String(id)).onSnapshot(function(doc) {
        const n = doc.exists ? doc.data().compte : 0;
        localStorage.setItem(cacheKey, n);
        el.textContent = "👁 " + n + (n > 1 ? " vues" : " vue");
        el.style.display = estAdmin ? "block" : "none";
    }, function() {
        el.style.display = estAdmin ? "block" : "none";
    });
}

/* ============================================================
   LIRE AUSSI
   ============================================================ */
function afficherLireAussi(artActuel) {
    const zone = document.getElementById("lire-aussi");
    if (!zone) return;
    const sugg = articles.filter(function(a) { return a.id !== artActuel.id; }).slice(0, 3);
    if (!sugg.length) { zone.innerHTML = ""; return; }
    let html = `<h3>${T[langueActuelle].lire_aussi}</h3><div class='lire-aussi-grille'>`;
    sugg.forEach(function(art) {
        const img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");
        const v = estPremium(art) && !estAbonne && !estAdmin;
        html += `<div class="lire-aussi-carte" data-id="${art.id}">
            <img src="${img}" ${v?'style="filter:blur(3px)"':""} alt="">
            <p>${v?"🔒 ":""}${art.titre}</p>
        </div>`;
    });
    html += "</div>";
    zone.innerHTML = html;
    zone.querySelectorAll(".lire-aussi-carte").forEach(function(c) {
        c.addEventListener("click", function() { ouvrirArticle(Number(c.dataset.id)); });
    });
}

/* ============================================================
   OUVRIR UN ARTICLE
   ============================================================ */
function ouvrirArticle(id) {
    const art = articles.find(function(a) { return a.id === id; });
    if (!art) return;
    const premium = estPremium(art);
    const verr = premium && !estAbonne && !estAdmin;
    const img = art.image || ("https://picsum.photos/seed/" + encodeURIComponent(art.titre) + "/400/200");

    document.getElementById("detail-img").src = img;
    document.getElementById("detail-img").style.filter = verr ? "blur(6px)" : "none";
    document.getElementById("detail-badge").textContent = art.categorie;
    document.getElementById("detail-titre").textContent = art.titre;
    document.getElementById("detail-date").textContent = art.date;

    const dr = document.getElementById("detail-resume");
    if (verr) {
        const txt = (art.contenu || "").replace(/<[^>]+>/g, "");
        dr.innerHTML = `<p style="font-family:'Times New Roman',serif;font-size:12pt;filter:blur(4px);user-select:none;">${txt.substring(0, 120)}...</p>`;
    } else {
        dr.innerHTML = `<div style="font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;">${art.contenu || ""}</div>`;
    }
    document.getElementById("verrou-premium").style.display = verr ? "flex" : "none";

    // Vidéo
    const zv = document.getElementById("detail-video-zone");
    zv.innerHTML = "";
    if (!verr) {
        if (art.videoFichier) {
            zv.innerHTML = `<video class="article-video" src="${art.videoFichier}" controls playsinline style="width:100%;border-radius:8px;"></video>`;
        } else if (art.video) {
            if (art.video.includes("youtube") || art.video.includes("youtu.be")) {
                const vid = art.video.includes("v=") ? art.video.split("v=")[1].split("&")[0] : art.video.split("/").pop();
                zv.innerHTML = `<iframe class="article-video" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>`;
            } else if (art.video.includes("facebook.com")) {
                zv.innerHTML = `<iframe class="article-video" src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(art.video)}&show_text=false" frameborder="0" allowfullscreen></iframe>`;
            }
        }
    }

    // 5. Bouton partager Facebook : admin seulement
    const artUrl = window.location.href.split("#")[0] + "#article-" + id;
    const btnPart = document.getElementById("btn-partager-article");
    btnPart.style.display = estAdmin ? "inline-flex" : "none";
    btnPart.onclick = function() { partagerFacebook(artUrl); };

    // 6. Vues
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

/* ============================================================
   FILTRES
   ============================================================ */
boutonsFiltre.forEach(function(b) {
    b.addEventListener("click", function() {
        boutonsFiltre.forEach(function(x) { x.classList.remove("actif"); });
        b.classList.add("actif");
        categorieActuelle = b.dataset.categorie;
        afficherArticles();
    });
});

/* ============================================================
   CLIC SUR LES CARTES
   ============================================================ */
conteneur.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-partager-carte")) {
        const id = Number(e.target.dataset.id);
        const art = articles.find(function(a) { return a.id === id; });
        if (art) partagerFacebook(window.location.href.split("#")[0] + "#article-" + id);
        return;
    }
    if (e.target.classList.contains("btn-supprimer")) {
        const id = Number(e.target.dataset.id);
        if (confirm("Supprimer cet article ?")) {
            articles = articles.filter(function(a) { return a.id !== id; });
            localStorage.setItem("articlesUNDR", JSON.stringify(articles));
            afficherArticles();
        }
        return;
    }
    if (e.target.classList.contains("btn-modifier")) {
        const id = Number(e.target.dataset.id);
        const art = articles.find(function(a) { return a.id === id; });
        if (!art) return;
        document.getElementById("nouveau-titre").value = art.titre;
        document.getElementById("nouvelle-categorie").value = art.categorie;
        document.getElementById("editeur-contenu").innerHTML = art.contenu || "";
        document.getElementById("nouvelle-video").value = art.video || "";
        document.getElementById("article-premium").checked = art.premium === true;
        document.getElementById("apercu-image-admin").innerHTML = art.image ? `<img src="${art.image}" style="max-height:80px;border-radius:6px;">` : "";
        document.getElementById("apercu-video-admin").innerHTML = art.videoFichier ? `<video src="${art.videoFichier}" style="max-height:80px;border-radius:6px;" controls></video>` : "";
        videoFichierData = art.videoFichier || null;
        modeEdition = true; idEdition = id;
        document.getElementById("bouton-publier").textContent = "Enregistrer";
        document.getElementById("formulaire-ajout").scrollIntoView({ behavior: "smooth" });
        return;
    }
    const carte = e.target.closest(".article");
    if (carte && !e.target.classList.contains("select-importance")) {
        const id = Number(carte.dataset.id);
        const art = articles.find(function(a) { return a.id === id; });
        if (art && estPremium(art) && !estAbonne && !estAdmin) { ouvrirModalAbonnement(); return; }
        if (art) ouvrirArticle(id);
    }
});

/* ============================================================
   APERÇU IMAGE ET VIDÉO ADMIN
   ============================================================ */
document.getElementById("nouvelle-image").addEventListener("change", function() {
    const f = this.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = function(e) { document.getElementById("apercu-image-admin").innerHTML = `<img src="${e.target.result}" style="max-height:80px;border-radius:6px;margin-top:4px;">`; };
    r.readAsDataURL(f);
});
document.getElementById("nouvelle-video-fichier").addEventListener("change", function() {
    const f = this.files[0]; if (!f) return;
    if (f.size > 50*1024*1024) { alert("Vidéo trop lourde. Maximum 50 Mo."); this.value=""; return; }
    const r = new FileReader();
    r.onload = function(e) {
        videoFichierData = e.target.result;
        document.getElementById("apercu-video-admin").innerHTML = `<video src="${e.target.result}" style="max-height:100px;border-radius:6px;margin-top:4px;" controls></video>`;
    };
    r.readAsDataURL(f);
});

/* ============================================================
   PUBLIER / MODIFIER
   ============================================================ */
document.getElementById("bouton-publier").addEventListener("click", function() {
    const titre = document.getElementById("nouveau-titre").value.trim();
    const contenu = document.getElementById("editeur-contenu").innerHTML.trim();
    if (!titre || !contenu) { alert("Merci de remplir le titre et le contenu."); return; }

    function sauver(imgData) {
        const obj = {
            titre: titre, contenu: contenu,
            categorie: document.getElementById("nouvelle-categorie").value,
            video: document.getElementById("nouvelle-video").value.trim(),
            videoFichier: videoFichierData || "",
            premium: document.getElementById("article-premium").checked,
            image: imgData || "",
            importance: 0
        };
        if (modeEdition && idEdition !== null) {
            const idx = articles.findIndex(function(a) { return a.id === idEdition; });
            if (idx !== -1) {
                obj.importance = articles[idx].importance || 0;
                Object.assign(articles[idx], obj);
            }
            modeEdition = false; idEdition = null;
            document.getElementById("bouton-publier").textContent = "Publier";
        } else {
            obj.id = Date.now();
            obj.date = new Date().toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric"});
            obj.importance = 2; // Nouveau = très important par défaut
            articles.unshift(obj);
            // Notification push locale
            envoyerNotifLocale(titre);
        }
        localStorage.setItem("articlesUNDR", JSON.stringify(articles));
        // Réinitialiser
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

    const fi = document.getElementById("nouvelle-image").files[0];
    if (fi) { const r = new FileReader(); r.onload = function(e) { sauver(e.target.result); }; r.readAsDataURL(fi); }
    else {
        const artExist = modeEdition && idEdition ? articles.find(function(a) { return a.id === idEdition; }) : null;
        sauver(artExist ? artExist.image : null);
    }
});

/* ============================================================
   3. MODAL ADHÉSION + GÉNÉRATION PDF CORRIGÉE
   ============================================================ */
function ouvrirModalAdhesion() {
    ["adh-nom","adh-tel","adh-region","adh-organe","adh-poste"].forEach(function(id) {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    const n = document.getElementById("adh-naissance"); if (n) n.value = "";
    document.getElementById("apercu-photo").innerHTML = "";
    const a = document.getElementById("adh-accord"); if (a) a.checked = false;
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
    const f = this.files[0]; if (!f) return;
    if (f.size > 2*1024*1024) { alert("Photo trop lourde (max 2 Mo)."); this.value = ""; return; }
    const r = new FileReader();
    r.onload = function(e) { document.getElementById("apercu-photo").innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:110px;border-radius:6px;margin-top:6px;">`; };
    r.readAsDataURL(f);
});

document.getElementById("btn-suivant-adhesion").addEventListener("click", function() {
    const nom = document.getElementById("adh-nom").value.trim();
    const naiss = document.getElementById("adh-naissance").value;
    const tel = document.getElementById("adh-tel").value.trim();
    const reg = document.getElementById("adh-region").value.trim();
    const photo = document.getElementById("adh-photo").files[0];
    if (!nom || !naiss || !tel || !reg || !photo) { alert("Merci de remplir tous les champs obligatoires (*)."); return; }
    const org = document.getElementById("adh-organe").value.trim();
    const post = document.getElementById("adh-poste").value.trim();
    document.getElementById("recapitulatif-adhesion").innerHTML = `
        <div class="recap-ligne"><span>Nom :</span><strong>${nom}</strong></div>
        <div class="recap-ligne"><span>Naissance :</span><strong>${naiss}</strong></div>
        <div class="recap-ligne"><span>Téléphone :</span><strong>${tel}</strong></div>
        <div class="recap-ligne"><span>Région :</span><strong>${reg}</strong></div>
        ${org?`<div class="recap-ligne"><span>Organe :</span><strong>${org}</strong></div>`:""}
        ${post?`<div class="recap-ligne"><span>Poste :</span><strong>${post}</strong></div>`:""}
        <div class="recap-ligne"><span>Photo :</span><strong>✅ Jointe</strong></div>`;
    document.getElementById("etape-adhesion-1").style.display = "none";
    document.getElementById("etape-adhesion-2").style.display = "block";
});
document.getElementById("btn-retour-adhesion").addEventListener("click", function() {
    document.getElementById("etape-adhesion-2").style.display = "none";
    document.getElementById("etape-adhesion-1").style.display = "block";
});

document.getElementById("btn-soumettre-adhesion").addEventListener("click", function() {
    if (!document.getElementById("adh-accord").checked) { alert("Vous devez accepter la charte de l'UNDR."); return; }
    const num = "UNDR-" + Date.now().toString().slice(-6);
    const d = {
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
    const photoFile = document.getElementById("adh-photo").files[0];

    function finaliser(photoDataUrl) {
        // Sauvegarder
        const dem = JSON.parse(localStorage.getItem("adhesionsUNDR") || "[]");
        dem.push(d);
        localStorage.setItem("adhesionsUNDR", JSON.stringify(dem));
        if (window.db) {
            window.db.collection("adhesions").add(Object.assign({}, d, { date: firebase.firestore.FieldValue.serverTimestamp() })).catch(function(){});
        }
        // Mémoriser pour re-téléchargement
        derniereDemande = { data: d, photo: photoDataUrl };
        // Générer PDF
        genererPDFAdhesion(d, photoDataUrl);
        // Succès
        document.getElementById("num-dossier").textContent = num;
        document.getElementById("etape-adhesion-2").style.display = "none";
        document.getElementById("etape-adhesion-3").style.display = "block";
        // Bouton re-télécharger
        const btnR = document.getElementById("btn-retelecharger-pdf");
        if (btnR) btnR.onclick = function() { if (derniereDemande) genererPDFAdhesion(derniereDemande.data, derniereDemande.photo); };
    }

    if (photoFile) {
        const r = new FileReader();
        r.onload = function(e) { finaliser(e.target.result); };
        r.readAsDataURL(photoFile);
    } else { finaliser(null); }
});

/* ============================================================
   3. GÉNÉRATION PDF — VERSION CORRIGÉE (sans dépendance externe)
   Utilise Canvas + téléchargement direct en base64
   ============================================================ */
function genererPDFAdhesion(d, photoDataUrl) {
    // Essayer jsPDF si disponible
    if (window.jspdf && window.jspdf.jsPDF) {
        genererAvecJsPDF(d, photoDataUrl);
        return;
    }
    // Fallback : générer un HTML imprimable et déclencher l'impression
    genererHTMLImprimable(d, photoDataUrl);
}

function genererAvecJsPDF(d, photoDataUrl) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit:"mm", format:"a4" });

        // Entête bleue
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, 210, 36, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18); doc.setFont("helvetica","bold");
        doc.text("UNDR — L'Espoir", 105, 13, {align:"center"});
        doc.setFontSize(11); doc.setFont("helvetica","normal");
        doc.text("FICHE D'ADHÉSION", 105, 22, {align:"center"});
        doc.setFontSize(8);
        doc.text("Groupe Parlementaire UNDR — Assemblée Nationale du Tchad", 105, 30, {align:"center"});

        // Bande orange
        doc.setFillColor(230, 126, 34);
        doc.rect(0, 36, 210, 4, "F");

        // Numéro dossier
        doc.setFillColor(240, 244, 255);
        doc.roundedRect(14, 46, 182, 12, 2, 2, "F");
        doc.setTextColor(0, 51, 102); doc.setFontSize(10); doc.setFont("helvetica","bold");
        doc.text("Dossier : " + d.id, 20, 54);
        doc.setTextColor(100,100,100); doc.setFontSize(9); doc.setFont("helvetica","normal");
        doc.text("Date : " + d.date, 170, 54, {align:"right"});

        // Photo
        const px=155, py=64, pw=40, ph=48;
        doc.setDrawColor(0,51,102); doc.setLineWidth(0.6);
        doc.rect(px, py, pw, ph);
        if (photoDataUrl) {
            try { doc.addImage(photoDataUrl, "JPEG", px+0.5, py+0.5, pw-1, ph-1); }
            catch(e) { doc.setFontSize(7); doc.setTextColor(150,150,150); doc.text("Photo", px+pw/2, py+ph/2, {align:"center"}); }
        } else {
            doc.setFontSize(7); doc.setTextColor(150,150,150);
            doc.text("Photo", px+pw/2, py+ph/2-3, {align:"center"});
            doc.text("d'identité", px+pw/2, py+ph/2+3, {align:"center"});
        }
        doc.setFontSize(7); doc.setTextColor(100,100,100);
        doc.text("Photo d'identité", px+pw/2, py+ph+4, {align:"center"});

        // Champs
        let y = 68;
        doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(0,51,102);
        doc.text("Informations personnelles", 14, y);
        doc.setFillColor(230,126,34); doc.rect(14, y+2, 55, 0.8, "F");
        y += 10;

        const champs = [
            ["Nom et Prénom", d.nom],
            ["Date de naissance", d.naissance],
            ["Téléphone", d.tel],
            ["Adresse / Région", d.region],
            ["Organe du Parti", d.organe || "—"],
            ["Poste occupé", d.poste || "—"]
        ];
        champs.forEach(function(c) {
            doc.setFillColor(248, 249, 255);
            doc.roundedRect(14, y-4.5, 134, 9, 1, 1, "F");
            doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(0,51,102);
            doc.text(c[0]+" :", 18, y);
            doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40);
            doc.text(c[1] || "—", 65, y);
            y += 12;
        });

        // Charte
        y += 2;
        doc.setFillColor(0,51,102); doc.rect(0, y, 210, 0.4, "F");
        y += 6;
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(0,51,102);
        doc.text("Charte d'adhésion", 14, y);
        y += 8;
        doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(50,50,50);
        ["• Respecter les statuts et règlements du parti",
         "• Contribuer activement aux activités du mouvement",
         "• Défendre les valeurs de démocratie et de développement",
         "• Payer la cotisation annuelle fixée par la direction"
        ].forEach(function(l) { doc.text(l, 18, y); y += 7; });

        // Signatures
        y += 4;
        doc.setFillColor(240,244,255); doc.roundedRect(14, y, 84, 26, 2, 2, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,51,102);
        doc.text("Signature du membre", 56, y+7, {align:"center"});
        doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
        doc.text("(Lu et approuvé)", 56, y+13, {align:"center"});
        doc.setDrawColor(0,51,102); doc.setLineWidth(0.3); doc.line(22, y+22, 88, y+22);

        doc.setFillColor(240,244,255); doc.roundedRect(110, y, 84, 26, 2, 2, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(0,51,102);
        doc.text("Visa du responsable UNDR", 152, y+7, {align:"center"});
        doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
        doc.text("Cachet et signature", 152, y+13, {align:"center"});
        doc.line(118, y+22, 188, y+22);

        // Pied de page
        doc.setFillColor(0,51,102); doc.rect(0, 280, 210, 17, "F");
        doc.setFillColor(230,126,34); doc.rect(0, 278.5, 210, 1.5, "F");
        doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
        doc.text("UNDR — Union Nationale pour la Démocratie et le Renouveau  |  +235 66 79 77 51", 105, 286, {align:"center"});
        doc.text("Document généré automatiquement le " + d.date, 105, 292, {align:"center"});

        doc.save("adhesion_" + d.id + ".pdf");
    } catch(err) {
        console.error("Erreur jsPDF:", err);
        genererHTMLImprimable(d, photoDataUrl);
    }
}

// Fallback : page HTML imprimable qui s'ouvre dans un nouvel onglet
function genererHTMLImprimable(d, photoDataUrl) {
    const photoHTML = photoDataUrl
        ? `<img src="${photoDataUrl}" style="width:100%;height:100%;object-fit:cover;">`
        : `<p style="color:#999;font-size:11px;text-align:center;margin:0;padding-top:30px;">Photo<br>d'identité</p>`;

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Fiche adhésion ${d.id}</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;background:#fff;}
        .entete{background:#003366;color:white;padding:20px;text-align:center;}
        .entete h1{font-size:20px;} .entete p{font-size:12px;margin-top:4px;}
        .bande{height:6px;background:#e67e22;}
        .corps{padding:20px;display:flex;gap:20px;}
        .infos{flex:1;} .photo-zone{width:110px;flex-shrink:0;}
        .photo-cadre{width:100px;height:120px;border:2px solid #003366;overflow:hidden;}
        .num{background:#f0f4ff;padding:10px;border-radius:6px;margin-bottom:16px;font-size:13px;}
        .num strong{color:#003366;font-size:15px;}
        table{width:100%;border-collapse:collapse;margin-bottom:16px;}
        td{padding:6px 8px;font-size:12px;border-bottom:1px solid #eee;}
        td:first-child{font-weight:bold;color:#003366;width:40%;}
        .charte{background:#f8f9fa;padding:12px;border-radius:6px;font-size:11px;margin-bottom:16px;}
        .charte h3{color:#003366;margin-bottom:6px;}
        .signatures{display:flex;gap:16px;}
        .sig{flex:1;background:#f0f4ff;padding:10px;border-radius:6px;font-size:11px;text-align:center;}
        .sig-ligne{border-top:1px solid #003366;margin-top:30px;padding-top:4px;color:#888;}
        .pied{background:#003366;color:white;padding:12px;text-align:center;font-size:10px;margin-top:20px;}
        @media print{.no-print{display:none;} body{margin:0;}}
    </style></head><body>
    <div class="no-print" style="background:#e67e22;color:white;padding:10px;text-align:center;">
        <button onclick="window.print()" style="background:white;color:#e67e22;border:none;padding:8px 20px;border-radius:20px;font-weight:bold;font-size:14px;cursor:pointer;">🖨️ Télécharger / Imprimer la fiche</button>
    </div>
    <div class="entete"><h1>UNDR — L'Espoir</h1><p>FICHE D'ADHÉSION — Groupe Parlementaire UNDR</p></div>
    <div class="bande"></div>
    <div style="padding:16px;">
        <div class="num">Dossier : <strong>${d.id}</strong> &nbsp;&nbsp; Date : ${d.date}</div>
        <div class="corps">
            <div class="infos">
                <table>
                    <tr><td>Nom et Prénom</td><td>${d.nom}</td></tr>
                    <tr><td>Date de naissance</td><td>${d.naissance}</td></tr>
                    <tr><td>Téléphone</td><td>${d.tel}</td></tr>
                    <tr><td>Adresse / Région</td><td>${d.region}</td></tr>
                    <tr><td>Organe du Parti</td><td>${d.organe||"—"}</td></tr>
                    <tr><td>Poste occupé</td><td>${d.poste||"—"}</td></tr>
                </table>
            </div>
            <div class="photo-zone">
                <div class="photo-cadre">${photoHTML}</div>
                <p style="font-size:10px;color:#888;text-align:center;margin-top:4px;">Photo d'identité</p>
            </div>
        </div>
        <div class="charte">
            <h3>Charte d'adhésion</h3>
            <p>• Respecter les statuts et règlements du parti</p>
            <p>• Contribuer activement aux activités du mouvement</p>
            <p>• Défendre les valeurs de démocratie et de développement</p>
            <p>• Payer la cotisation annuelle fixée par la direction</p>
        </div>
        <div class="signatures">
            <div class="sig"><strong>Signature du membre</strong><br><small>Lu et approuvé</small><div class="sig-ligne"></div></div>
            <div class="sig"><strong>Visa du responsable UNDR</strong><br><small>Cachet et signature</small><div class="sig-ligne"></div></div>
        </div>
    </div>
    <div class="pied">UNDR — +235 66 79 77 51 — Document généré le ${d.date}</div>
    <script>setTimeout(function(){window.print();},800);</scr`+`ipt></body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "adhesion_" + d.id + ".html";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 3000);
}

/* ============================================================
   4. MODAL ABONNEMENT — ACTIVATION IMMÉDIATE APRÈS PAIEMENT
   ============================================================ */
let intervalVerif = null;
let transactionId = null;

function afficherEtapePaiement(num) {
    ["1","2","erreur"].forEach(function(n) {
        const el = document.getElementById(n==="erreur"?"etape-paiement-erreur":"etape-paiement-"+n);
        if (el) el.style.display = "none";
    });
    const cible = document.getElementById(num==="erreur"?"etape-paiement-erreur":"etape-paiement-"+num);
    if (cible) cible.style.display = "block";
}

function ouvrirModalAbonnement() {
    afficherEtapePaiement("1");
    ["abo-nom","abo-tel","abo-ref"].forEach(function(id) {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    document.getElementById("abo-operateur").value = "";
    document.getElementById("modal-abonnement").style.display = "flex";
}
function fermerModalAbonnement() {
    document.getElementById("modal-abonnement").style.display = "none";
    if (intervalVerif) { clearInterval(intervalVerif); intervalVerif = null; }
}

document.getElementById("fermer-abonnement").addEventListener("click", fermerModalAbonnement);
document.getElementById("modal-abonnement").addEventListener("click", function(e) { if (e.target === this) fermerModalAbonnement(); });
document.getElementById("btn-annuler-paiement").addEventListener("click", function() { fermerModalAbonnement(); ouvrirModalAbonnement(); });
document.getElementById("btn-reessayer").addEventListener("click", function() { afficherEtapePaiement("1"); });

// 4. ACTIVER L'ABONNEMENT IMMÉDIATEMENT et rafraîchir la page
function activerAbonnementImmediatement(nom, tel, op, txId) {
    // Activer immédiatement côté client
    estAbonne = true;
    localStorage.setItem("abonneUNDR", "true");
    localStorage.setItem("abonneTelUNDR", tel);
    localStorage.setItem("abonneNomUNDR", nom);

    // Enregistrer dans la liste admin
    const ab = JSON.parse(localStorage.getItem("abonnesUNDR") || "[]");
    ab.push({ nom:nom, tel:tel, operateur:op, txId:txId||"sim-"+Date.now(), date:new Date().toLocaleDateString("fr-FR"), statut:"Validé" });
    localStorage.setItem("abonnesUNDR", JSON.stringify(ab));

    // Enregistrer dans Firebase
    if (window.db) {
        window.db.collection("abonnements").add({ nom:nom, tel:tel, operateur:op, txId:txId||"", date:firebase.firestore.FieldValue.serverTimestamp(), statut:"Validé" }).catch(function(){});
    }
}

document.getElementById("btn-payer").addEventListener("click", function() {
    const nom = document.getElementById("abo-nom").value.trim();
    const tel = document.getElementById("abo-tel").value.trim();
    const op  = document.getElementById("abo-operateur").value;
    const ref = document.getElementById("abo-ref").value.trim();

    if (!nom || !tel || !op || !ref) {
        document.getElementById("msg-erreur-paiement").textContent =
            "Merci de remplir tous les champs et d'entrer le numéro de référence de votre transaction.";
        afficherEtapePaiement("erreur");
        return;
    }

    // Activer l'abonnement immédiatement côté client
    activerAbonnementImmediatement(nom, tel, op, ref);

    // Afficher la référence confirmée
    document.getElementById("ref-confirmee").textContent = ref;
    afficherEtapePaiement("2");
});

document.getElementById("fermer-succes-abo").addEventListener("click", function() {
    fermerModalAbonnement();
    // Rafraîchir l'affichage immédiatement
    mettreAJourBandeauAbo();
    afficherArticles();
    alert("🎉 Bienvenue ! Vous avez maintenant accès à tous les contenus UNDR.");
});

/* ============================================================
   ADMIN — LISTES
   ============================================================ */
function chargerAdhesionsAdmin() {
    const zone = document.getElementById("liste-adhesions"); if (!zone) return;
    const dem = JSON.parse(localStorage.getItem("adhesionsUNDR") || "[]");
    if (!dem.length) { zone.innerHTML = "<p style='color:#888;font-size:13px;'>Aucune demande.</p>"; return; }
    zone.innerHTML = dem.map(function(d, i) {
        return `<div class="adhesion-item">
            <strong>${d.nom}</strong> — ${d.region} — 📞 ${d.tel}<br>
            ${d.organe?`<small>Organe: ${d.organe} | Poste: ${d.poste||"—"}</small><br>`:""}
            <small>${d.naissance} | ${d.id} | ${d.date}</small><br>
            <span class="badge-statut ${d.statut==="Validé"?"valide":"attente"}">${d.statut}</span>
            ${d.statut!=="Validé"?`<button class="btn-valider-adhesion" data-index="${i}">✅</button>`:""}
            <button class="btn-suppr-adhesion" data-index="${i}">🗑</button>
        </div>`;
    }).join("");
    zone.querySelectorAll(".btn-valider-adhesion").forEach(function(b) {
        b.addEventListener("click", function() {
            const d=JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
            d[Number(b.dataset.index)].statut="Validé";
            localStorage.setItem("adhesionsUNDR",JSON.stringify(d)); chargerAdhesionsAdmin();
        });
    });
    zone.querySelectorAll(".btn-suppr-adhesion").forEach(function(b) {
        b.addEventListener("click", function() {
            const d=JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
            d.splice(Number(b.dataset.index),1);
            localStorage.setItem("adhesionsUNDR",JSON.stringify(d)); chargerAdhesionsAdmin();
        });
    });
}

function chargerAbonnesAdmin() {
    const zone = document.getElementById("liste-abonnes"); if (!zone) return;
    const ab = JSON.parse(localStorage.getItem("abonnesUNDR") || "[]");
    if (!ab.length) { zone.innerHTML = "<p style='color:#888;font-size:13px;'>Aucun abonné.</p>"; return; }
    zone.innerHTML = ab.map(function(a, i) {
        return `<div class="adhesion-item">
            <strong>${a.nom}</strong> — ${a.operateur} — 📞 ${a.tel}<br>
            <small>TX: ${a.txId||"—"} | ${a.date}</small><br>
            <span class="badge-statut ${a.statut==="Validé"?"valide":"attente"}">${a.statut}</span>
            <button class="btn-suppr-abo" data-index="${i}">🗑</button>
        </div>`;
    }).join("");
    zone.querySelectorAll(".btn-suppr-abo").forEach(function(b) {
        b.addEventListener("click", function() {
            const a=JSON.parse(localStorage.getItem("abonnesUNDR")||"[]");
            a.splice(Number(b.dataset.index),1);
            localStorage.setItem("abonnesUNDR",JSON.stringify(a)); chargerAbonnesAdmin();
        });
    });
}

/* ============================================================
   PUBLICITÉS MAISON
   ============================================================ */
function chargerPubsAdmin() {
    const ph=JSON.parse(localStorage.getItem("pubHautUNDR")||"null");
    const pb=JSON.parse(localStorage.getItem("pubBasUNDR")||"null");
    if(ph){document.getElementById("pub-haut-titre").value=ph.titre||"";document.getElementById("pub-haut-lien").value=ph.lien||"";}
    if(pb){document.getElementById("pub-bas-titre").value=pb.titre||"";document.getElementById("pub-bas-lien").value=pb.lien||"";}
}
function afficherPubMaison(zone,data){
    if(!data||!data.image){zone.style.display="none";return;}
    zone.style.display="block";
    zone.innerHTML=`<a href="${data.lien||"#"}" target="_blank" class="pub-maison-lien"><img src="${data.image}" class="pub-maison-img" alt="Pub"><span class="pub-label">Publicité</span></a>`;
}
function rafraichirPubs(){
    afficherPubMaison(document.getElementById("pub-maison-haut"),JSON.parse(localStorage.getItem("pubHautUNDR")||"null"));
    afficherPubMaison(document.getElementById("pub-maison-bas"),JSON.parse(localStorage.getItem("pubBasUNDR")||"null"));
}
function enregistrerPub(cle,tId,lId,iId){
    const t=document.getElementById(tId).value.trim(),l=document.getElementById(lId).value.trim(),f=document.getElementById(iId).files[0];
    function s(img){localStorage.setItem(cle,JSON.stringify({titre:t,lien:l,image:img}));rafraichirPubs();alert("Pub enregistrée !");}
    if(f){const r=new FileReader();r.onload=function(e){s(e.target.result);};r.readAsDataURL(f);}
    else{const ex=JSON.parse(localStorage.getItem(cle)||"null");s(ex?ex.image:"");}
}
document.getElementById("btn-sauver-pub-haut").addEventListener("click",function(){enregistrerPub("pubHautUNDR","pub-haut-titre","pub-haut-lien","pub-haut-image");});
document.getElementById("btn-sauver-pub-bas").addEventListener("click",function(){enregistrerPub("pubBasUNDR","pub-bas-titre","pub-bas-lien","pub-bas-image");});

/* ============================================================
   DIRECT FACEBOOK
   ============================================================ */
document.getElementById("toggle-direct").addEventListener("click", function() {
    const z=document.getElementById("zone-direct"); const o=z.style.display!=="none";
    z.style.display=o?"none":"block";
});

/* ============================================================
   MODE SOMBRE
   ============================================================ */
const ts = document.getElementById("toggle-sombre");
if (localStorage.getItem("modeSombreUNDR")==="true") { document.body.classList.add("mode-sombre"); ts.checked=true; }
ts.addEventListener("change",function(){ document.body.classList.toggle("mode-sombre",ts.checked); localStorage.setItem("modeSombreUNDR",ts.checked); });

/* ============================================================
   TAILLE DU TEXTE
   ============================================================ */
function appliquerTaille(n){const t={petit:"14px",normal:"16px",grand:"19px"};document.body.style.fontSize=t[n]||"16px";localStorage.setItem("tailleTexteUNDR",n);}
document.querySelectorAll(".taille-btn").forEach(function(b){b.addEventListener("click",function(){appliquerTaille(b.dataset.taille);});});
appliquerTaille(localStorage.getItem("tailleTexteUNDR")||"normal");

/* ============================================================
   INITIALISATION
   ============================================================ */
appliquerLangue(langueActuelle);
mettreAJourBandeauAbo();
mettreAJourPointAdmin();
metAJourAffichageAdmin();
rafraichirPubs();
afficherArticles();

// 2. Ajuster l'espace sous l'entête fixe
function ajusterEspaceEntete() {
    const entete = document.getElementById("entete-fixe");
    const espace = document.getElementById("espace-entete");
    if (entete && espace) espace.style.height = entete.offsetHeight + "px";
}
ajusterEspaceEntete();
window.addEventListener("resize", ajusterEspaceEntete);
// Recalculer après affichage du bandeau
new MutationObserver(ajusterEspaceEntete).observe(
    document.getElementById("bandeau-abonnement"),
    { attributes: true, attributeFilter: ["style"] }
);

// 1. Demander les notifications après 3 secondes
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(function(){});
}
setTimeout(demanderNotifications, 3000);

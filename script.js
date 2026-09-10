/* ============================================================
   UNDR Actualités — script.js
   Corrections : vidéo upload, traduction arabe complète,
   paiement USSD Push style Pariez Cash (CinetPay/simulation)
   ============================================================ */

const MOT_DE_PASSE_ADMIN = "undr2026";
let estAdmin = sessionStorage.getItem("adminUNDR") === "true";
let estAbonne = localStorage.getItem("abonneUNDR") === "true";
const CATEGORIES_PREMIUM = ["Actualités","Communiqués","Actualités Tchad","Actualités Politique","Divertissement"];

/* ============================================================
   TRADUCTIONS COMPLÈTES (fr / en / ar)
   ============================================================ */
const T = {
    fr: {
        menu_adherer:"Adhérer à l'UNDR", menu_abonner:"S'abonner", menu_partager:"Partager l'application",
        menu_langue:"Langue", menu_apparence:"Apparence", menu_sombre:"Mode sombre", menu_taille:"Taille du texte",
        bandeau_texte:"Contenu réservé aux abonnés", btn_adherer:"Adhérer", btn_abonner:"S'abonner",
        cat_toutes:"Toutes", cat_actu:"Actualités", cat_activ:"Activités", cat_com:"Communiqués",
        cat_bne:"Portraits BNE", cat_tchad:"Tchad", cat_pol:"Politique", cat_div:"Divertissement",
        form_titre:"Ajouter un article",
        btn_retour:"Retour", btn_partager_art:"Partager cet article",
        verrou_titre:"Contenu réservé aux abonnés",
        verrou_texte:"Abonnez-vous pour accéder à l'intégralité de cet article.",
        btn_abo_verrou:"S'abonner — 1 000 FCFA/mois",
        adh_titre:"Adhérer à l'UNDR",
        adh_sous:"Rejoignez le mouvement pour l'espoir et le renouveau du Tchad",
        adh_identite:"Votre identité", adh_naissance:"Date de naissance *", adh_photo:"Photo d'identité * (max 2 Mo)",
        adh_confirm:"Confirmation", adh_succes:"Demande envoyée !",
        adh_succes_texte:"Un responsable de l'UNDR vous contactera sous 48h.",
        charte_titre:"En adhérant à l'UNDR, je m'engage à :",
        charte_1:"Respecter les statuts et règlements du parti",
        charte_2:"Contribuer activement aux activités du mouvement",
        charte_3:"Défendre les valeurs de démocratie et de développement",
        charte_4:"Payer la cotisation annuelle fixée par la direction",
        charte_accord:"J'accepte la charte et les statuts de l'UNDR",
        btn_suivant:"Suivant →", btn_retour_f:"← Retour", btn_soumettre:"✅ Soumettre", btn_fermer:"Fermer",
        abo_titre:"Abonnement Premium", abo_sous:"Accédez à tous les contenus exclusifs de l'UNDR",
        abo_av1:"Tous les articles sans restriction", abo_av2:"Actualités politiques exclusives",
        abo_av3:"Communiqués officiels complets", abo_av4:"Divertissement & contenus spéciaux",
        paiement_coords:"Vos coordonnées", paiement_choisir:"Choisir l'opérateur",
        btn_payer:"Payer 1 000 FCFA",
        paiement_attente:"Vérifiez votre téléphone !",
        paiement_attente_texte:"Une demande de confirmation a été envoyée sur votre numéro. Entrez votre code PIN pour confirmer le paiement de 1 000 FCFA.",
        paiement_ne_quittez:"Ne quittez pas cette page...",
        btn_annuler:"Annuler",
        paiement_succes:"Paiement confirmé !", paiement_succes_texte:"Votre abonnement est activé. Bonne lecture !",
        paiement_echec:"Paiement non confirmé", paiement_echec_texte:"Le paiement n'a pas été confirmé. Vérifiez votre solde et réessayez.",
        btn_reessayer:"Réessayer",
        chat_titre:"Chat en direct", btn_envoyer:"Envoyer",
        btn_direct:"Suivre le Direct", lire_aussi:"Lire aussi"
    },
    en: {
        menu_adherer:"Join UNDR", menu_abonner:"Subscribe", menu_partager:"Share the app",
        menu_langue:"Language", menu_apparence:"Appearance", menu_sombre:"Dark mode", menu_taille:"Text size",
        bandeau_texte:"Content for subscribers only", btn_adherer:"Join", btn_abonner:"Subscribe",
        cat_toutes:"All", cat_actu:"News", cat_activ:"Activities", cat_com:"Press releases",
        cat_bne:"BNE Portraits", cat_tchad:"Chad", cat_pol:"Politics", cat_div:"Entertainment",
        form_titre:"Add an article",
        btn_retour:"Back", btn_partager_art:"Share this article",
        verrou_titre:"Content for subscribers only",
        verrou_texte:"Subscribe to access the full article.",
        btn_abo_verrou:"Subscribe — 1,000 FCFA/month",
        adh_titre:"Join UNDR",
        adh_sous:"Join the movement for hope and renewal of Chad",
        adh_identite:"Your identity", adh_naissance:"Date of birth *", adh_photo:"ID photo * (max 2 MB)",
        adh_confirm:"Confirmation", adh_succes:"Request sent!",
        adh_succes_texte:"An UNDR representative will contact you within 48h.",
        charte_titre:"By joining UNDR, I commit to:",
        charte_1:"Respect the party's statutes and regulations",
        charte_2:"Actively contribute to the movement's activities",
        charte_3:"Defend the values of democracy and development",
        charte_4:"Pay the annual membership fee set by the leadership",
        charte_accord:"I accept the UNDR charter and statutes",
        btn_suivant:"Next →", btn_retour_f:"← Back", btn_soumettre:"✅ Submit", btn_fermer:"Close",
        abo_titre:"Premium Subscription", abo_sous:"Access all exclusive UNDR content",
        abo_av1:"All articles without restriction", abo_av2:"Exclusive political news",
        abo_av3:"Full official press releases", abo_av4:"Entertainment & special content",
        paiement_coords:"Your details", paiement_choisir:"Choose operator",
        btn_payer:"Pay 1,000 FCFA",
        paiement_attente:"Check your phone!",
        paiement_attente_texte:"A confirmation request has been sent to your number. Enter your PIN to confirm the payment of 1,000 FCFA.",
        paiement_ne_quittez:"Do not leave this page...",
        btn_annuler:"Cancel",
        paiement_succes:"Payment confirmed!", paiement_succes_texte:"Your subscription is active. Enjoy reading!",
        paiement_echec:"Payment not confirmed", paiement_echec_texte:"Payment was not confirmed. Check your balance and try again.",
        btn_reessayer:"Try again",
        chat_titre:"Live Chat", btn_envoyer:"Send",
        btn_direct:"Watch Live", lire_aussi:"Read also"
    },
    ar: {
        menu_adherer:"الانضمام إلى UNDR", menu_abonner:"الاشتراك", menu_partager:"مشاركة التطبيق",
        menu_langue:"اللغة", menu_apparence:"المظهر", menu_sombre:"الوضع المظلم", menu_taille:"حجم الخط",
        bandeau_texte:"محتوى مخصص للمشتركين فقط", btn_adherer:"انضم", btn_abonner:"اشترك",
        cat_toutes:"الكل", cat_actu:"أخبار", cat_activ:"أنشطة", cat_com:"بيانات",
        cat_bne:"صور المكتب", cat_tchad:"تشاد", cat_pol:"سياسة", cat_div:"ترفيه",
        form_titre:"إضافة مقال",
        btn_retour:"رجوع", btn_partager_art:"مشاركة هذا المقال",
        verrou_titre:"محتوى مخصص للمشتركين",
        verrou_texte:"اشترك للوصول إلى المقال كاملاً.",
        btn_abo_verrou:"اشترك — 1 000 فرنك/شهر",
        adh_titre:"الانضمام إلى UNDR",
        adh_sous:"انضم إلى حركة الأمل وتجديد تشاد",
        adh_identite:"هويتك", adh_naissance:"تاريخ الميلاد *", adh_photo:"صورة الهوية * (أقصى 2 ميغا)",
        adh_confirm:"تأكيد", adh_succes:"تم إرسال الطلب!",
        adh_succes_texte:"سيتصل بك أحد مسؤولي UNDR خلال 48 ساعة.",
        charte_titre:"بانضمامي إلى UNDR، أتعهد بـ:",
        charte_1:"احترام النظام الأساسي للحزب",
        charte_2:"المشاركة الفعالة في أنشطة الحركة",
        charte_3:"الدفاع عن قيم الديمقراطية والتنمية",
        charte_4:"دفع الاشتراك السنوي المحدد من القيادة",
        charte_accord:"أوافق على ميثاق ونظام UNDR الأساسي",
        btn_suivant:"التالي ←", btn_retour_f:"رجوع →", btn_soumettre:"✅ إرسال", btn_fermer:"إغلاق",
        abo_titre:"اشتراك مميز", abo_sous:"الوصول إلى جميع محتويات UNDR الحصرية",
        abo_av1:"جميع المقالات بدون قيود", abo_av2:"أخبار سياسية حصرية",
        abo_av3:"بيانات رسمية كاملة", abo_av4:"ترفيه ومحتوى خاص",
        paiement_coords:"بياناتك", paiement_choisir:"اختر المشغل",
        btn_payer:"دفع 1 000 فرنك",
        paiement_attente:"تحقق من هاتفك!",
        paiement_attente_texte:"تم إرسال طلب تأكيد إلى رقمك. أدخل رمز PIN لتأكيد دفع 1 000 فرنك.",
        paiement_ne_quittez:"لا تغادر هذه الصفحة...",
        btn_annuler:"إلغاء",
        paiement_succes:"تم تأكيد الدفع!", paiement_succes_texte:"اشتراكك مفعّل. استمتع بالقراءة!",
        paiement_echec:"لم يتم تأكيد الدفع", paiement_echec_texte:"لم يتم تأكيد الدفع. تحقق من رصيدك وحاول مجدداً.",
        btn_reessayer:"حاول مجدداً",
        chat_titre:"دردشة مباشرة", btn_envoyer:"إرسال",
        btn_direct:"متابعة البث المباشر", lire_aussi:"اقرأ أيضاً"
    }
};

let langueActuelle = localStorage.getItem("langueUNDR") || "fr";

function appliquerLangue(lang) {
    langueActuelle = lang;
    localStorage.setItem("langueUNDR", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
        const cle = el.getAttribute("data-i18n");
        if (T[lang] && T[lang][cle]) el.textContent = T[lang][cle];
    });
    // Placeholders
    const pls = {
        "adh-nom": { fr:"Nom et Prénom complet *", en:"Full name *", ar:"الاسم الكامل *" },
        "adh-tel": { fr:"Numéro de téléphone *", en:"Phone number *", ar:"رقم الهاتف *" },
        "adh-region": { fr:"Adresse / Région / Ville *", en:"Address / Region / City *", ar:"العنوان / المنطقة / المدينة *" },
        "adh-organe": { fr:"Organe du Parti", en:"Party organ", ar:"هيئة الحزب" },
        "adh-poste": { fr:"Poste occupé", en:"Position held", ar:"المنصب المشغول" },
        "abo-nom": { fr:"Nom et Prénom *", en:"Full name *", ar:"الاسم الكامل *" },
        "abo-tel": { fr:"Numéro Mobile Money *", en:"Mobile Money number *", ar:"رقم Mobile Money *" },
        "chat-pseudo": { fr:"Votre nom", en:"Your name", ar:"اسمك" },
        "chat-message": { fr:"Votre message", en:"Your message", ar:"رسالتك" }
    };
    Object.keys(pls).forEach(function (id) {
        const el = document.getElementById(id);
        if (el && pls[id][lang]) el.placeholder = pls[id][lang];
    });
}

document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { appliquerLangue(btn.dataset.lang); });
});

/* ============================================================
   ARTICLES
   ============================================================ */
const articlesParDefaut = [
    { id:1, titre:"Session parlementaire ouverte", date:"20 juillet 2026", contenu:"Le Groupe Parlementaire UNDR a participé à l'ouverture de la nouvelle session.", categorie:"Actualités", image:"", video:"", videoFichier:"", premium:true },
    { id:2, titre:"Visite de terrain dans la région Nord", date:"15 juillet 2026", contenu:"Une délégation du groupe s'est rendue sur le terrain pour rencontrer les populations.", categorie:"Activités", image:"", video:"", videoFichier:"", premium:false },
    { id:3, titre:"Déclaration officielle du groupe", date:"10 juillet 2026", contenu:"Le groupe a publié une déclaration concernant les récents débats budgétaires.", categorie:"Communiqués", image:"", video:"", videoFichier:"", premium:true }
];

let articles = JSON.parse(localStorage.getItem("articlesUNDR")) || articlesParDefaut;
let categorieActuelle = "Toutes";
let modeEdition = false;
let idEdition = null;
let videoFichierData = null;

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
    p.title = estAdmin ? "Admin actif — cliquer pour quitter" : "";
}

document.getElementById("point-admin").addEventListener("click", function (e) {
    e.stopPropagation();
    if (estAdmin) {
        if (confirm("Quitter le mode administration ?")) {
            estAdmin = false; sessionStorage.removeItem("adminUNDR");
            mettreAJourPointAdmin(); metAJourAffichageAdmin(); afficherArticles();
        }
    } else {
        const s = prompt("Mot de passe administrateur :");
        if (s === MOT_DE_PASSE_ADMIN) {
            estAdmin = true; sessionStorage.setItem("adminUNDR", "true"); alert("✅ Mode admin activé.");
        } else if (s !== null) { alert("❌ Mot de passe incorrect."); }
        mettreAJourPointAdmin(); metAJourAffichageAdmin(); afficherArticles();
    }
});

function metAJourAffichageAdmin() {
    const f = document.getElementById("formulaire-ajout");
    if (f) f.style.display = estAdmin ? "block" : "none";
    if (estAdmin) { chargerAdhesionsAdmin(); chargerAbonnesAdmin(); chargerPubsAdmin(); }
}

/* ============================================================
   BANDEAU ET ABONNEMENT
   ============================================================ */
function mettreAJourBandeauAbo() {
    const b = document.getElementById("bandeau-abonnement");
    if (b) b.style.display = (!estAbonne && !estAdmin) ? "block" : "none";
    const s = document.getElementById("statut-abonnement-panneau");
    if (!s) return;
    if (estAbonne) {
        s.innerHTML = `<div class="statut-abo actif">💎 ${T[langueActuelle].abo_titre || "Abonnement actif"}</div>
            <button id="btn-resil-abo" class="btn-resilier">Se désabonner</button>`;
        document.getElementById("btn-resil-abo").addEventListener("click", function () {
            if (confirm("Voulez-vous vous désabonner ?")) {
                localStorage.removeItem("abonneUNDR"); estAbonne = false;
                mettreAJourBandeauAbo(); afficherArticles();
            }
        });
    } else {
        s.innerHTML = `<div class="statut-abo inactif">🔒 Pas d'abonnement actif</div>
            <button class="btn-payer" id="btn-abo-panneau" style="margin-top:8px; width:100%;">S'abonner — 1 000 FCFA/mois</button>`;
        document.getElementById("btn-abo-panneau").addEventListener("click", function () {
            fermerMenuGauche(); ouvrirModalAbonnement();
        });
    }
}

/* ============================================================
   MENU GAUCHE
   ============================================================ */
function ouvrirMenuGauche() { mettreAJourBandeauAbo(); document.getElementById("menu-gauche").style.display="block"; document.getElementById("overlay-menu-gauche").style.display="block"; }
function fermerMenuGauche() { document.getElementById("menu-gauche").style.display="none"; document.getElementById("overlay-menu-gauche").style.display="none"; }
document.getElementById("ouvrir-menu-gauche").addEventListener("click", ouvrirMenuGauche);
document.getElementById("fermer-menu-gauche").addEventListener("click", fermerMenuGauche);
document.getElementById("overlay-menu-gauche").addEventListener("click", fermerMenuGauche);
document.getElementById("menu-btn-adherer").addEventListener("click", function () { fermerMenuGauche(); ouvrirModalAdhesion(); });
document.getElementById("menu-btn-abonner").addEventListener("click", function () { fermerMenuGauche(); ouvrirModalAbonnement(); });
document.getElementById("menu-btn-partager").addEventListener("click", function () { fermerMenuGauche(); partagerLien(window.location.href, "UNDR Actualités"); });

/* ============================================================
   PARTAGE
   ============================================================ */
function partagerLien(url, titre) {
    if (navigator.share) { navigator.share({ title: titre, url: url }).catch(function(){}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function(){ alert("Lien copié !"); }); }
    else { prompt("Copiez ce lien :", url); }
}

/* ============================================================
   AFFICHAGE ARTICLES
   ============================================================ */
function afficherArticles() {
    conteneur.innerHTML = "";
    let liste = articles.filter(function(a){ return categorieActuelle==="Toutes" || a.categorie===categorieActuelle; });
    liste.forEach(function(art, i) {
        const div = document.createElement("div");
        const premium = estPremium(art);
        const verr = premium && !estAbonne && !estAdmin;
        div.className = i===0 ? "article une" : "article";
        if (verr) div.classList.add("article-verrou");
        div.dataset.id = art.id;
        const img = art.image || ("https://picsum.photos/seed/"+encodeURIComponent(art.titre)+"/400/200");
        div.innerHTML = `
            <img src="${img}" class="article-img${verr?" img-floue":""}" alt="${art.titre}">
            ${verr?`<div class="carte-verrou-overlay"><span>🔒</span><small>Abonnez-vous</small></div>`:""}
            <span class="badge">${art.categorie}</span>${premium?`<span class="badge-premium">🔒 Premium</span>`:""}
            <h2>${art.titre}</h2>
            <p class="date-article">${art.date}</p>
            <button class="btn-partager-carte" data-id="${art.id}">📤</button>
            ${estAdmin?`<div class="admin-carte-btns">
                <button class="btn-modifier" data-id="${art.id}">✏️ Modifier</button>
                <button class="btn-supprimer" data-id="${art.id}">🗑 Supprimer</button>
            </div>`:""}
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
    ref.get().then(function(doc){ ref.set({ compte: (doc.exists?doc.data().compte:0)+1 }); });
}
function afficherVue(id) {
    if (!window.db) return;
    window.db.collection("vues").doc(String(id)).onSnapshot(function(doc){
        const el = document.getElementById("detail-vues");
        if (!el) return;
        const n = doc.exists ? doc.data().compte : 0;
        el.textContent = "👁 "+n+(n>1?" vues":" vue")+" (admin)";
        el.style.display = estAdmin ? "block" : "none";
    });
}

/* ============================================================
   LIRE AUSSI
   ============================================================ */
function afficherLireAussi(artActuel) {
    const zone = document.getElementById("lire-aussi");
    if (!zone) return;
    const sugg = articles.filter(function(a){ return a.id!==artActuel.id; }).slice(0,3);
    if (!sugg.length) { zone.innerHTML=""; return; }
    let html = `<h3>${T[langueActuelle].lire_aussi||"Lire aussi"}</h3><div class='lire-aussi-grille'>`;
    sugg.forEach(function(art){
        const img = art.image||("https://picsum.photos/seed/"+encodeURIComponent(art.titre)+"/400/200");
        const v = estPremium(art)&&!estAbonne&&!estAdmin;
        html+=`<div class="lire-aussi-carte" data-id="${art.id}">
            <img src="${img}" ${v?'style="filter:blur(3px)"':""} alt="">
            <p>${v?"🔒 ":""}${art.titre}</p></div>`;
    });
    html+="</div>";
    zone.innerHTML=html;
    zone.querySelectorAll(".lire-aussi-carte").forEach(function(c){ c.addEventListener("click",function(){ ouvrirArticle(Number(c.dataset.id)); }); });
}

/* ============================================================
   OUVRIR UN ARTICLE
   ============================================================ */
function ouvrirArticle(id) {
    const art = articles.find(function(a){ return a.id===id; });
    if (!art) return;
    const premium = estPremium(art);
    const verr = premium && !estAbonne && !estAdmin;
    const img = art.image||("https://picsum.photos/seed/"+encodeURIComponent(art.titre)+"/400/200");

    document.getElementById("detail-img").src = img;
    document.getElementById("detail-img").style.filter = verr?"blur(6px)":"none";
    document.getElementById("detail-badge").textContent = art.categorie;
    document.getElementById("detail-titre").textContent = art.titre;
    document.getElementById("detail-date").textContent = art.date;

    const dr = document.getElementById("detail-resume");
    if (verr) {
        const txt = (art.contenu||"").replace(/<[^>]+>/g,"");
        dr.innerHTML=`<p style="font-family:'Times New Roman',serif;font-size:12pt;filter:blur(4px);user-select:none;">${txt.substring(0,100)}...</p>`;
    } else {
        dr.innerHTML=`<div style="font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;">${art.contenu||""}</div>`;
    }
    document.getElementById("verrou-premium").style.display = verr?"flex":"none";

    // Vidéo
    const zv = document.getElementById("detail-video-zone");
    zv.innerHTML="";
    if (!verr) {
        if (art.videoFichier) {
            // Vidéo uploadée depuis le téléphone
            zv.innerHTML=`<video class="article-video" src="${art.videoFichier}" controls playsinline style="width:100%;border-radius:8px;"></video>`;
        } else if (art.video) {
            if (art.video.includes("youtube")||art.video.includes("youtu.be")) {
                const vid = art.video.includes("v=")?art.video.split("v=")[1].split("&")[0]:art.video.split("/").pop();
                zv.innerHTML=`<iframe class="article-video" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>`;
            } else if (art.video.includes("facebook.com")) {
                zv.innerHTML=`<iframe class="article-video" src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(art.video)}&show_text=false" frameborder="0" allowfullscreen></iframe>`;
            }
        }
    }

    // Bouton partager
    document.getElementById("btn-partager-article").onclick = function(){
        partagerLien(window.location.href+"#article-"+id, art.titre);
    };

    incrementerVue(id); afficherVue(id);
    conteneur.style.display="none";
    document.getElementById("filtres-list").style.display="none";
    document.getElementById("vue-detail").style.display="block";
    afficherLireAussi(art);
    window.scrollTo(0,0);
}

document.getElementById("retour-liste").addEventListener("click", function(){
    document.getElementById("vue-detail").style.display="none";
    conteneur.style.display="grid";
    document.getElementById("filtres-list").style.display="flex";
});
document.getElementById("btn-abo-verrou").addEventListener("click", ouvrirModalAbonnement);
document.getElementById("bandeau-btn-adherer").addEventListener("click", ouvrirModalAdhesion);
document.getElementById("bandeau-btn-abo").addEventListener("click", ouvrirModalAbonnement);

/* ============================================================
   FILTRES
   ============================================================ */
boutonsFiltre.forEach(function(b){
    b.addEventListener("click", function(){
        boutonsFiltre.forEach(function(x){ x.classList.remove("actif"); });
        b.classList.add("actif");
        categorieActuelle = b.dataset.categorie;
        afficherArticles();
    });
});

/* ============================================================
   CLIC SUR LES CARTES
   ============================================================ */
conteneur.addEventListener("click", function(e){
    if (e.target.classList.contains("btn-partager-carte")) {
        const id=Number(e.target.dataset.id); const art=articles.find(function(a){return a.id===id;});
        if (art) partagerLien(window.location.href+"#article-"+id, art.titre); return;
    }
    if (e.target.classList.contains("btn-supprimer")) {
        const id=Number(e.target.dataset.id);
        if (confirm("Supprimer cet article ?")) { articles=articles.filter(function(a){return a.id!==id;}); localStorage.setItem("articlesUNDR",JSON.stringify(articles)); afficherArticles(); } return;
    }
    if (e.target.classList.contains("btn-modifier")) {
        const id=Number(e.target.dataset.id); const art=articles.find(function(a){return a.id===id;});
        if (!art) return;
        document.getElementById("nouveau-titre").value=art.titre;
        document.getElementById("nouvelle-categorie").value=art.categorie;
        document.getElementById("editeur-contenu").innerHTML=art.contenu||"";
        document.getElementById("nouvelle-video").value=art.video||"";
        document.getElementById("article-premium").checked=art.premium===true;
        document.getElementById("apercu-image-admin").innerHTML = art.image ? `<img src="${art.image}" style="max-height:80px;border-radius:6px;margin-top:6px;">` : "";
        document.getElementById("apercu-video-admin").innerHTML = art.videoFichier ? `<video src="${art.videoFichier}" style="max-height:80px;border-radius:6px;margin-top:6px;" controls></video>` : "";
        videoFichierData = art.videoFichier || null;
        modeEdition=true; idEdition=id;
        document.getElementById("bouton-publier").textContent="Enregistrer";
        document.getElementById("formulaire-ajout").scrollIntoView({behavior:"smooth"}); return;
    }
    const carte = e.target.closest(".article");
    if (carte) {
        const id=Number(carte.dataset.id); const art=articles.find(function(a){return a.id===id;});
        if (art && estPremium(art) && !estAbonne && !estAdmin) { ouvrirModalAbonnement(); return; }
        ouvrirArticle(id);
    }
});

/* ============================================================
   APERÇU IMAGE ET VIDÉO dans le formulaire admin
   ============================================================ */
document.getElementById("nouvelle-image").addEventListener("change", function(){
    const f=this.files[0]; if (!f) return;
    const r=new FileReader(); r.onload=function(e){ document.getElementById("apercu-image-admin").innerHTML=`<img src="${e.target.result}" style="max-height:80px;border-radius:6px;margin-top:6px;">`; }; r.readAsDataURL(f);
});

document.getElementById("nouvelle-video-fichier").addEventListener("change", function(){
    const f=this.files[0]; if (!f) return;
    if (f.size > 50*1024*1024) { alert("Vidéo trop lourde. Maximum 50 Mo."); this.value=""; return; }
    const r=new FileReader();
    r.onload=function(e){
        videoFichierData = e.target.result;
        document.getElementById("apercu-video-admin").innerHTML=`<video src="${e.target.result}" style="max-height:100px;border-radius:6px;margin-top:6px;" controls></video>`;
    };
    r.readAsDataURL(f);
});

/* ============================================================
   PUBLIER / MODIFIER
   ============================================================ */
document.getElementById("bouton-publier").addEventListener("click", function(){
    const titre=document.getElementById("nouveau-titre").value.trim();
    const contenu=document.getElementById("editeur-contenu").innerHTML.trim();
    if (!titre||!contenu) { alert("Merci de remplir le titre et le contenu."); return; }

    function sauver(imgData) {
        const obj = {
            titre: titre,
            contenu: contenu,
            categorie: document.getElementById("nouvelle-categorie").value,
            video: document.getElementById("nouvelle-video").value.trim(),
            videoFichier: videoFichierData || "",
            premium: document.getElementById("article-premium").checked,
            image: imgData || ""
        };
        if (modeEdition && idEdition!==null) {
            const idx=articles.findIndex(function(a){return a.id===idEdition;});
            if (idx!==-1) { Object.assign(articles[idx], obj); }
            modeEdition=false; idEdition=null;
            document.getElementById("bouton-publier").textContent="Publier";
        } else {
            obj.id=Date.now();
            obj.date=new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
            articles.unshift(obj);
        }
        localStorage.setItem("articlesUNDR",JSON.stringify(articles));
        document.getElementById("nouveau-titre").value="";
        document.getElementById("editeur-contenu").innerHTML="";
        document.getElementById("nouvelle-video").value="";
        document.getElementById("nouvelle-image").value="";
        document.getElementById("nouvelle-video-fichier").value="";
        document.getElementById("apercu-image-admin").innerHTML="";
        document.getElementById("apercu-video-admin").innerHTML="";
        document.getElementById("article-premium").checked=false;
        videoFichierData=null;
        afficherArticles();
        alert("✅ Article publié !");
    }

    const fi=document.getElementById("nouvelle-image").files[0];
    if (fi) { const r=new FileReader(); r.onload=function(e){sauver(e.target.result);}; r.readAsDataURL(fi); }
    else { sauver(modeEdition && idEdition ? (articles.find(function(a){return a.id===idEdition;})||{}).image : null); }
});

/* ============================================================
   MODAL ADHÉSION
   ============================================================ */
function ouvrirModalAdhesion() {
    ["adh-nom","adh-tel","adh-region","adh-organe","adh-poste"].forEach(function(id){ const el=document.getElementById(id); if(el) el.value=""; });
    const n=document.getElementById("adh-naissance"); if(n) n.value="";
    document.getElementById("apercu-photo").innerHTML="";
    const a=document.getElementById("adh-accord"); if(a) a.checked=false;
    document.getElementById("etape-adhesion-1").style.display="block";
    document.getElementById("etape-adhesion-2").style.display="none";
    document.getElementById("etape-adhesion-3").style.display="none";
    document.getElementById("modal-adhesion").style.display="flex";
}
function fermerModalAdhesion(){ document.getElementById("modal-adhesion").style.display="none"; }
document.getElementById("fermer-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("fermer-succes-adhesion").addEventListener("click", fermerModalAdhesion);
document.getElementById("modal-adhesion").addEventListener("click", function(e){ if(e.target===this) fermerModalAdhesion(); });

document.getElementById("adh-photo").addEventListener("change", function(){
    const f=this.files[0]; if(!f) return;
    if(f.size>2*1024*1024){alert("Photo trop lourde (max 2 Mo).");this.value="";return;}
    const r=new FileReader(); r.onload=function(e){ document.getElementById("apercu-photo").innerHTML=`<img src="${e.target.result}" style="max-width:100%;max-height:110px;border-radius:6px;margin-top:6px;">`; }; r.readAsDataURL(f);
});

document.getElementById("btn-suivant-adhesion").addEventListener("click", function(){
    const nom=document.getElementById("adh-nom").value.trim();
    const naiss=document.getElementById("adh-naissance").value;
    const tel=document.getElementById("adh-tel").value.trim();
    const reg=document.getElementById("adh-region").value.trim();
    const photo=document.getElementById("adh-photo").files[0];
    if(!nom||!naiss||!tel||!reg||!photo){alert("Merci de remplir tous les champs obligatoires (*).");return;}
    const org=document.getElementById("adh-organe").value.trim();
    const post=document.getElementById("adh-poste").value.trim();
    document.getElementById("recapitulatif-adhesion").innerHTML=`
        <div class="recap-ligne"><span>Nom :</span><strong>${nom}</strong></div>
        <div class="recap-ligne"><span>Naissance :</span><strong>${naiss}</strong></div>
        <div class="recap-ligne"><span>Téléphone :</span><strong>${tel}</strong></div>
        <div class="recap-ligne"><span>Région :</span><strong>${reg}</strong></div>
        ${org?`<div class="recap-ligne"><span>Organe :</span><strong>${org}</strong></div>`:""}
        ${post?`<div class="recap-ligne"><span>Poste :</span><strong>${post}</strong></div>`:""}
        <div class="recap-ligne"><span>Photo :</span><strong>✅ Jointe</strong></div>`;
    document.getElementById("etape-adhesion-1").style.display="none";
    document.getElementById("etape-adhesion-2").style.display="block";
});
document.getElementById("btn-retour-adhesion").addEventListener("click", function(){
    document.getElementById("etape-adhesion-2").style.display="none";
    document.getElementById("etape-adhesion-1").style.display="block";
});
document.getElementById("btn-soumettre-adhesion").addEventListener("click", function(){
    if(!document.getElementById("adh-accord").checked){alert("Vous devez accepter la charte de l'UNDR.");return;}
    const num="UNDR-"+Date.now().toString().slice(-6);
    const photoFile = document.getElementById("adh-photo").files[0];
    const d={
        id:num,
        nom:document.getElementById("adh-nom").value.trim(),
        naissance:document.getElementById("adh-naissance").value,
        tel:document.getElementById("adh-tel").value.trim(),
        region:document.getElementById("adh-region").value.trim(),
        organe:document.getElementById("adh-organe").value.trim(),
        poste:document.getElementById("adh-poste").value.trim(),
        date:new Date().toLocaleDateString("fr-FR"),
        statut:"En attente"
    };

    function finaliserAdhesion(photoDataUrl) {
        // Sauvegarder localement
        const dem=JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
        dem.push(d);
        localStorage.setItem("adhesionsUNDR",JSON.stringify(dem));
        // Sauvegarder dans Firebase
        if(window.db){ window.db.collection("adhesions").add({...d, date:firebase.firestore.FieldValue.serverTimestamp()}); }
        // Mémoriser pour re-téléchargement éventuel
        window._derniereDemande = { data: d, photo: photoDataUrl };
        // Générer et télécharger le PDF
        genererFicheAdhesionPDF(d, photoDataUrl);
        // Afficher écran succès
        document.getElementById("num-dossier").textContent=num;
        document.getElementById("etape-adhesion-2").style.display="none";
        document.getElementById("etape-adhesion-3").style.display="block";
        // Bouton re-télécharger
        const btnR = document.getElementById("btn-retelecharger-pdf");
        if (btnR) {
            btnR.onclick = function() {
                if (window._derniereDemande) {
                    genererFicheAdhesionPDF(window._derniereDemande.data, window._derniereDemande.photo);
                }
            };
        }
    }

    if(photoFile){
        const r=new FileReader();
        r.onload=function(e){ finaliserAdhesion(e.target.result); };
        r.readAsDataURL(photoFile);
    } else {
        finaliserAdhesion(null);
    }
});

/* ============================================================
   GÉNÉRATION PDF FICHE D'ADHÉSION
   Utilise jsPDF (chargé via CDN dans index.html)
   Le fichier est téléchargé dans le dossier Téléchargements
   avec le nom : adhesion/UNDR-XXXXXX.pdf
   ============================================================ */
function genererFicheAdhesionPDF(d, photoDataUrl) {
    // Vérifier que jsPDF est chargé
    if (typeof window.jspdf === "undefined" && typeof window.jsPDF === "undefined") {
        alert("⚠️ Erreur : la bibliothèque PDF n'est pas chargée. Vérifiez votre connexion internet.");
        return;
    }
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ unit:"mm", format:"a4" });

    const BLEU = [0, 51, 102];
    const ORANGE = [230, 126, 34];
    const GRIS = [100, 100, 100];
    const BLANC = [255, 255, 255];
    const CLAIRE = [240, 244, 255];

    // ── Fond entête ──
    doc.setFillColor(...BLEU);
    doc.rect(0, 0, 210, 38, "F");

    // ── Titre entête ──
    doc.setTextColor(...BLANC);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("UNDR — L'Espoir", 105, 14, { align:"center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("FICHE D'ADHÉSION", 105, 22, { align:"center" });
    doc.setFontSize(9);
    doc.text("Groupe Parlementaire UNDR — Assemblée Nationale du Tchad", 105, 29, { align:"center" });

    // ── Bande orange ──
    doc.setFillColor(...ORANGE);
    doc.rect(0, 38, 210, 5, "F");

    // ── Numéro de dossier ──
    doc.setFillColor(...CLAIRE);
    doc.roundedRect(14, 48, 182, 14, 3, 3, "F");
    doc.setTextColor(...BLEU);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("N° de dossier :", 20, 57);
    doc.setTextColor(...ORANGE);
    doc.setFontSize(13);
    doc.text(d.id, 72, 57);
    doc.setTextColor(...GRIS);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Date : "+d.date, 170, 57, { align:"right" });

    // ── Photo d'identité ──
    const photoX = 155, photoY = 68, photoW = 40, photoH = 50;
    doc.setDrawColor(...BLEU);
    doc.setLineWidth(0.8);
    doc.rect(photoX, photoY, photoW, photoH);
    if (photoDataUrl) {
        try {
            doc.addImage(photoDataUrl, "JPEG", photoX+0.5, photoY+0.5, photoW-1, photoH-1);
        } catch(e) {
            doc.setTextColor(...GRIS);
            doc.setFontSize(8);
            doc.text("Photo", photoX+photoW/2, photoY+photoH/2, {align:"center"});
        }
    } else {
        doc.setFontSize(8);
        doc.setTextColor(...GRIS);
        doc.text("Photo", photoX+photoW/2, photoY+photoH/2, {align:"center"});
        doc.text("d'identité", photoX+photoW/2, photoY+photoH/2+5, {align:"center"});
    }
    doc.setFontSize(7);
    doc.setTextColor(...GRIS);
    doc.text("Photo d'identité", photoX+photoW/2, photoY+photoH+5, {align:"center"});

    // ── Informations personnelles ──
    const champs = [
        ["Nom et Prénom", d.nom],
        ["Date de naissance", d.naissance],
        ["Numéro de téléphone", d.tel],
        ["Adresse / Région", d.region],
        ["Organe du Parti", d.organe || "—"],
        ["Poste occupé", d.poste || "—"],
    ];

    let y = 70;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLEU);
    doc.text("Informations personnelles", 14, y);
    doc.setFillColor(...ORANGE);
    doc.rect(14, y+2, 60, 1, "F");
    y += 10;

    champs.forEach(function(champ) {
        // Fond alterné
        doc.setFillColor(248, 249, 255);
        doc.roundedRect(14, y-5, 135, 10, 1.5, 1.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...BLEU);
        doc.text(champ[0]+" :", 18, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        doc.text(champ[1] || "—", 70, y);

        y += 13;
    });

    // ── Charte d'adhésion ──
    y += 4;
    doc.setFillColor(...BLEU);
    doc.rect(0, y, 210, 0.5, "F");
    y += 6;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLEU);
    doc.text("Charte d'adhésion", 14, y);
    doc.setFillColor(...ORANGE);
    doc.rect(14, y+2, 45, 1, "F");
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const engagements = [
        "• Respecter les statuts et règlements du parti",
        "• Contribuer activement aux activités du mouvement",
        "• Défendre les valeurs de démocratie et de développement",
        "• Payer la cotisation annuelle fixée par la direction"
    ];
    engagements.forEach(function(ligne) {
        doc.text(ligne, 18, y);
        y += 7;
    });

    // ── Zone de signature ──
    y += 6;
    doc.setFillColor(...CLAIRE);
    doc.roundedRect(14, y, 85, 28, 3, 3, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLEU);
    doc.text("Signature du membre", 56, y+8, {align:"center"});
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRIS);
    doc.text("(Lu et approuvé)", 56, y+14, {align:"center"});
    doc.setDrawColor(...BLEU);
    doc.setLineWidth(0.3);
    doc.line(22, y+24, 90, y+24);

    doc.setFillColor(...CLAIRE);
    doc.roundedRect(110, y, 85, 28, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLEU);
    doc.text("Visa du responsable UNDR", 152, y+8, {align:"center"});
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRIS);
    doc.text("Cachet et signature", 152, y+14, {align:"center"});
    doc.line(118, y+24, 188, y+24);

    // ── Pied de page ──
    doc.setFillColor(...BLEU);
    doc.rect(0, 280, 210, 17, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(0, 278, 210, 2, "F");
    doc.setTextColor(...BLANC);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("UNDR — Union Nationale pour la Démocratie et le Renouveau  |  +235 66 79 77 51  |  gouatainebienvenu3@gmail.com", 105, 286, {align:"center"});
    doc.text("Document généré le "+d.date, 105, 292, {align:"center"});

    // ── Téléchargement dans le dossier "adhesion" ──
    // Sur Android, le fichier va directement dans Téléchargements/
    // Le navigateur ne peut pas créer de sous-dossier, mais le nom "adhesion_UNDR-XXXXXX.pdf"
    // permet de les regrouper facilement
    const nomFichier = "adhesion_"+d.id+".pdf";
    doc.save(nomFichier);
}

/* ============================================================
   MODAL ABONNEMENT — USSD PUSH (style Pariez Cash)
   Le principe : on appelle l'API CinetPay avec le numéro
   de l'abonné → l'opérateur envoie une notification USSD
   sur son téléphone → il entre son PIN → paiement confirmé.
   ============================================================ */

// ⚠️ CONFIGURATION CINETPAY — À remplir avec vos vraies clés
// Créer un compte sur https://cinetpay.com et activer le Mobile Money Tchad
const CINETPAY_APIKEY = "VOTRE_API_KEY_CINETPAY";
const CINETPAY_SITE_ID = "VOTRE_SITE_ID_CINETPAY";

let intervalVerif = null;
let transactionId = null;

function afficherEtapePaiement(num) {
    ["1","2","3","erreur"].forEach(function(n){
        const el = document.getElementById(n==="erreur" ? "etape-paiement-erreur" : "etape-paiement-"+n);
        if (el) el.style.display = "none";
    });
    const cible = num==="erreur" ? document.getElementById("etape-paiement-erreur") : document.getElementById("etape-paiement-"+num);
    if (cible) cible.style.display = "block";
}

function ouvrirModalAbonnement() {
    afficherEtapePaiement("1");
    ["abo-nom","abo-tel"].forEach(function(id){ const el=document.getElementById(id); if(el) el.value=""; });
    document.getElementById("abo-operateur").value="";
    if (intervalVerif) { clearInterval(intervalVerif); intervalVerif=null; }
    document.getElementById("modal-abonnement").style.display="flex";
}
function fermerModalAbonnement(){ document.getElementById("modal-abonnement").style.display="none"; if(intervalVerif){clearInterval(intervalVerif);intervalVerif=null;} }
document.getElementById("fermer-abonnement").addEventListener("click", fermerModalAbonnement);
document.getElementById("modal-abonnement").addEventListener("click", function(e){ if(e.target===this) fermerModalAbonnement(); });
document.getElementById("fermer-succes-abo").addEventListener("click", function(){
    fermerModalAbonnement(); estAbonne=true; localStorage.setItem("abonneUNDR","true");
    mettreAJourBandeauAbo(); afficherArticles();
});
document.getElementById("btn-annuler-paiement").addEventListener("click", function(){ fermerModalAbonnement(); ouvrirModalAbonnement(); });
document.getElementById("btn-reessayer").addEventListener("click", function(){ afficherEtapePaiement("1"); });

// LANCER LE PAIEMENT USSD PUSH
document.getElementById("btn-payer").addEventListener("click", function(){
    const nom=document.getElementById("abo-nom").value.trim();
    const tel=document.getElementById("abo-tel").value.trim();
    const op=document.getElementById("abo-operateur").value;
    if(!nom||!tel||!op){alert("Merci de remplir tous les champs.");return;}

    // Afficher l'écran d'attente
    document.getElementById("tel-affiche").textContent = tel;
    document.getElementById("operateur-affiche").textContent = op==="airtel"?"Airtel Money":"Moov Money";
    afficherEtapePaiement("2");

    // Générer un ID de transaction unique
    transactionId = "UNDR-"+Date.now();

    // Formatage numéro : retirer 0 en début, ajouter indicatif Tchad 235
    let telFormate = tel.replace(/\s/g,"");
    if (telFormate.startsWith("0")) telFormate = telFormate.substring(1);
    if (!telFormate.startsWith("235")) telFormate = "235"+telFormate;

    // APPEL API CINETPAY — USSD PUSH
    // Décommentez quand vous avez vos clés CinetPay :
    /*
    fetch("https://api-checkout.cinetpay.com/v2/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            apikey: CINETPAY_APIKEY,
            site_id: CINETPAY_SITE_ID,
            transaction_id: transactionId,
            amount: 1000,
            currency: "XAF",
            description: "Abonnement UNDR Actualités",
            notify_url: "https://votre-site.github.io/notify",
            customer_name: nom,
            customer_surname: "",
            customer_phone_number: telFormate,
            customer_email: "abonne@undr.td",
            payment_method: op === "airtel" ? "AIRTELMONEYTCHAD" : "MOOVMONEYTCHAD",
            channels: "MOBILE_MONEY"
        })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
        if (data.code === "201") {
            // Paiement initié — vérifier toutes les 5 secondes
            demarrerVerification(transactionId);
        } else {
            document.getElementById("msg-erreur-paiement").textContent = data.message || "Erreur de paiement.";
            afficherEtapePaiement("erreur");
        }
    })
    .catch(function(){
        document.getElementById("msg-erreur-paiement").textContent = "Erreur de connexion. Vérifiez votre internet.";
        afficherEtapePaiement("erreur");
    });
    */

    // SIMULATION (à retirer quand CinetPay est configuré)
    // Simule une attente de 8 secondes puis succès
    setTimeout(function(){
        enregistrerAbonnement(nom, tel, op, transactionId, "simulé");
        afficherEtapePaiement("3");
    }, 8000);
});

// Vérification du statut du paiement (polling)
function demarrerVerification(txId) {
    let tentatives = 0;
    intervalVerif = setInterval(function(){
        tentatives++;
        if (tentatives > 24) { // 2 minutes max
            clearInterval(intervalVerif);
            document.getElementById("msg-erreur-paiement").textContent = "Délai dépassé. Réessayez.";
            afficherEtapePaiement("erreur");
            return;
        }
        fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apikey: CINETPAY_APIKEY, site_id: CINETPAY_SITE_ID, transaction_id: txId })
        })
        .then(function(r){ return r.json(); })
        .then(function(data){
            if (data.code === "00" && data.data && data.data.status === "ACCEPTED") {
                clearInterval(intervalVerif);
                enregistrerAbonnement(
                    document.getElementById("abo-nom").value.trim(),
                    document.getElementById("abo-tel").value.trim(),
                    document.getElementById("abo-operateur").value,
                    txId, data.data.payment_method
                );
                afficherEtapePaiement("3");
            } else if (data.data && data.data.status === "REFUSED") {
                clearInterval(intervalVerif);
                document.getElementById("msg-erreur-paiement").textContent = "Paiement refusé par l'opérateur.";
                afficherEtapePaiement("erreur");
            }
        }).catch(function(){});
    }, 5000);
}

function enregistrerAbonnement(nom, tel, op, txId, methode) {
    const ab=JSON.parse(localStorage.getItem("abonnesUNDR")||"[]");
    ab.push({ nom:nom, tel:tel, operateur:op, txId:txId, methode:methode, date:new Date().toLocaleDateString("fr-FR"), statut:"Validé" });
    localStorage.setItem("abonnesUNDR", JSON.stringify(ab));
    if(window.db){ window.db.collection("abonnements").add({ nom:nom, tel:tel, operateur:op, txId:txId, date:firebase.firestore.FieldValue.serverTimestamp(), statut:"Validé" }); }
    estAbonne=true; localStorage.setItem("abonneUNDR","true");
}

/* ============================================================
   ADMIN — LISTES
   ============================================================ */
function chargerAdhesionsAdmin() {
    const zone=document.getElementById("liste-adhesions"); if(!zone) return;
    const dem=JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]");
    if(!dem.length){zone.innerHTML="<p style='color:#888;font-size:13px;'>Aucune demande.</p>";return;}
    zone.innerHTML=dem.map(function(d,i){return `<div class="adhesion-item">
        <strong>${d.nom}</strong> — ${d.region} — 📞 ${d.tel}<br>
        ${d.organe?`<small>Organe: ${d.organe} | Poste: ${d.poste||"—"}</small><br>`:""}
        <small>${d.naissance} | ${d.id} | ${d.date}</small><br>
        <span class="badge-statut ${d.statut==="Validé"?"valide":"attente"}">${d.statut}</span>
        ${d.statut!=="Validé"?`<button class="btn-valider-adhesion" data-index="${i}">✅</button>`:""}
        <button class="btn-suppr-adhesion" data-index="${i}">🗑</button>
    </div>`;}).join("");
    zone.querySelectorAll(".btn-valider-adhesion").forEach(function(b){ b.addEventListener("click",function(){ const d=JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]"); d[Number(b.dataset.index)].statut="Validé"; localStorage.setItem("adhesionsUNDR",JSON.stringify(d)); chargerAdhesionsAdmin(); }); });
    zone.querySelectorAll(".btn-suppr-adhesion").forEach(function(b){ b.addEventListener("click",function(){ const d=JSON.parse(localStorage.getItem("adhesionsUNDR")||"[]"); d.splice(Number(b.dataset.index),1); localStorage.setItem("adhesionsUNDR",JSON.stringify(d)); chargerAdhesionsAdmin(); }); });
}

function chargerAbonnesAdmin() {
    const zone=document.getElementById("liste-abonnes"); if(!zone) return;
    const ab=JSON.parse(localStorage.getItem("abonnesUNDR")||"[]");
    if(!ab.length){zone.innerHTML="<p style='color:#888;font-size:13px;'>Aucun abonné.</p>";return;}
    zone.innerHTML=ab.map(function(a,i){return `<div class="adhesion-item">
        <strong>${a.nom}</strong> — ${a.operateur} — 📞 ${a.tel}<br>
        <small>TX: ${a.txId||a.ref||"—"} | ${a.date}</small><br>
        <span class="badge-statut ${a.statut==="Validé"?"valide":"attente"}">${a.statut}</span>
        <button class="btn-suppr-abo" data-index="${i}">🗑</button>
    </div>`;}).join("");
    zone.querySelectorAll(".btn-suppr-abo").forEach(function(b){ b.addEventListener("click",function(){ const a=JSON.parse(localStorage.getItem("abonnesUNDR")||"[]"); a.splice(Number(b.dataset.index),1); localStorage.setItem("abonnesUNDR",JSON.stringify(a)); chargerAbonnesAdmin(); }); });
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
function afficherPubMaison(zone,data){ if(!data||!data.image){zone.style.display="none";return;} zone.style.display="block"; zone.innerHTML=`<a href="${data.lien||"#"}" target="_blank" class="pub-maison-lien"><img src="${data.image}" class="pub-maison-img" alt="${data.titre||"Pub"}"><span class="pub-label">Publicité</span></a>`; }
function rafraichirPubs(){ afficherPubMaison(document.getElementById("pub-maison-haut"),JSON.parse(localStorage.getItem("pubHautUNDR")||"null")); afficherPubMaison(document.getElementById("pub-maison-bas"),JSON.parse(localStorage.getItem("pubBasUNDR")||"null")); }
function enregistrerPub(cle,tId,lId,iId){ const t=document.getElementById(tId).value.trim(),l=document.getElementById(lId).value.trim(),f=document.getElementById(iId).files[0]; function s(img){localStorage.setItem(cle,JSON.stringify({titre:t,lien:l,image:img}));rafraichirPubs();alert("Pub enregistrée !");} if(f){const r=new FileReader();r.onload=function(e){s(e.target.result);};r.readAsDataURL(f);}else{const ex=JSON.parse(localStorage.getItem(cle)||"null");s(ex?ex.image:"");} }
document.getElementById("btn-sauver-pub-haut").addEventListener("click",function(){enregistrerPub("pubHautUNDR","pub-haut-titre","pub-haut-lien","pub-haut-image");});
document.getElementById("btn-sauver-pub-bas").addEventListener("click",function(){enregistrerPub("pubBasUNDR","pub-bas-titre","pub-bas-lien","pub-bas-image");});

/* ============================================================
   DIRECT FACEBOOK
   ============================================================ */
document.getElementById("toggle-direct").addEventListener("click", function(){
    const z=document.getElementById("zone-direct"); const o=z.style.display!=="none";
    z.style.display=o?"none":"block";
    this.querySelector("span")?this.querySelector("span").textContent=(o?T[langueActuelle].btn_direct:"✖ Fermer"):null;
});

/* ============================================================
   MODE SOMBRE
   ============================================================ */
const ts=document.getElementById("toggle-sombre");
if(localStorage.getItem("modeSombreUNDR")==="true"){document.body.classList.add("mode-sombre");ts.checked=true;}
ts.addEventListener("change",function(){document.body.classList.toggle("mode-sombre",ts.checked);localStorage.setItem("modeSombreUNDR",ts.checked);});

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

if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js");}

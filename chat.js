/* ============================================================
   UNDR Actualités — chat.js
   Firebase Firestore : chat en direct + compteurs de vues
   Projet : undr-actu-c3c93
   ============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyBHqV5kBxzDn3RRGOq0fXkhByiCPcovKPE",
    authDomain: "undr-actu-c3c93.firebaseapp.com",
    projectId: "undr-actu-c3c93",
    storageBucket: "undr-actu-c3c93.firebasestorage.app",
    messagingSenderId: "876878050929",
    appId: "1:876878050929:web:fbed51a7fd3e375ce3cdd0"
};

const chatMessages = document.getElementById("chat-messages");
const chatPseudo   = document.getElementById("chat-pseudo");
const chatInput    = document.getElementById("chat-message");
const chatEnvoyer  = document.getElementById("chat-envoyer");

if (typeof firebase === "undefined") {
    /* Le SDK Firebase n'a pas pu se charger (connexion, bloqueur de pub…) */
    if (chatMessages) chatMessages.innerHTML = "<p style='color:#999;font-size:13px;text-align:center;'>Chat momentanément indisponible. Vérifiez votre connexion et rechargez la page.</p>";
    if (chatEnvoyer) chatEnvoyer.disabled = true;
} else {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    window.db = db;

    /* Écoute en temps réel des 50 derniers messages */
    db.collection("messages")
        .orderBy("date", "asc")
        .limit(50)
        .onSnapshot(function(snapshot) {
            chatMessages.innerHTML = "";
            snapshot.forEach(function(doc) {
                const msg = doc.data();
                const div = document.createElement("div");
                div.className = "chat-msg";
                div.innerHTML = `<strong>${msg.pseudo} :</strong> ${msg.texte}`;
                chatMessages.appendChild(div);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, function(err) {
            chatMessages.innerHTML = "<p style='color:#c0392b;font-size:13px;text-align:center;'>Impossible de charger le chat (accès refusé par le serveur). Vérifiez les règles de sécurité Firestore.</p>";
            console.error("Erreur chat (lecture) :", err);
        });

    chatEnvoyer.addEventListener("click", function() {
        const pseudo = chatPseudo.value.trim() || "Anonyme";
        const texte  = chatInput.value.trim();
        if (!texte) return;

        chatEnvoyer.disabled = true;
        db.collection("messages").add({
            pseudo: pseudo,
            texte:  texte,
            date:   firebase.firestore.FieldValue.serverTimestamp()
        }).then(function() {
            chatInput.value = "";
        }).catch(function(err) {
            alert("Votre message n'a pas pu être envoyé (accès refusé par le serveur). Réessayez plus tard.");
            console.error("Erreur chat (envoi) :", err);
        }).finally(function() {
            chatEnvoyer.disabled = false;
        });
    });

    /* Envoyer avec la touche Entrée */
    chatInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") chatEnvoyer.click();
    });
}

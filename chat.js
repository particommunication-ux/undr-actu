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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db;

const chatMessages = document.getElementById("chat-messages");
const chatPseudo   = document.getElementById("chat-pseudo");
const chatInput    = document.getElementById("chat-message");
const chatEnvoyer  = document.getElementById("chat-envoyer");

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
    });

chatEnvoyer.addEventListener("click", function() {
    const pseudo = chatPseudo.value.trim() || "Anonyme";
    const texte  = chatInput.value.trim();
    if (!texte) return;

    db.collection("messages").add({
        pseudo: pseudo,
        texte:  texte,
        date:   firebase.firestore.FieldValue.serverTimestamp()
    });
    chatInput.value = "";
});

/* Envoyer avec la touche Entrée */
chatInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") chatEnvoyer.click();
});

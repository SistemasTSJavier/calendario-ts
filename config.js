// --- Google (inicio de sesión) ---
// OBLIGATORIO: usar el "Web client ID" del MISMO proyecto que Firebase (project_number = 809581021929).
// Firebase Console → Tu proyecto → Authentication → Sign-in method → Google → Web SDK configuration → copiar "Web client ID"
// Si el error dice "audience ... 489487806580" es que se está cargando otro Client ID (caché o config antigua): Ctrl+Shift+R o redeploy.
window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID = '809581021929-inuums3dn8q3dlrk4cso8bic44uoqhgh.apps.googleusercontent.com';

// --- Firebase (reservas compartidas para todos) ---
// Crea un proyecto en https://console.firebase.google.com/ → Configuración del proyecto → Tus apps → Web
window.TACTICAL_SUPPORT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAkoYVzpViRcHhXXOXzTgLq0bn3RuOBCrw",
    authDomain: "calendario-ts-ed5c4.firebaseapp.com",
    projectId: "calendario-ts-ed5c4",
    storageBucket: "calendario-ts-ed5c4.firebasestorage.app",
    messagingSenderId: "809581021929",
    appId: "1:809581021929:web:9b4ea3dfaec8a3a54c7e78"
  };

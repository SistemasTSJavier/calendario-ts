# Pasos para configurar la app web con Firebase

Sigue estos pasos en orden. Al terminar, las reservas del calendario se guardarán en la nube y **todos** las verán en cualquier dispositivo.

---

## Paso 1: Crear el proyecto en Firebase

1. Abre **[Firebase Console](https://console.firebase.google.com/)** e inicia sesión con tu cuenta de Google.
2. Clic en **“Agregar proyecto”** (o **“Create a project”**).
3. **Nombre del proyecto**: escribe uno, por ejemplo `calendario-ts` o `tactical-support`.
4. Si te pregunta por Google Analytics, puedes activarlo o desactivarlo. Clic en **“Continuar”**.
5. Clic en **“Crear proyecto”** y espera a que termine.

---

## Paso 2: Registrar la app web

1. En la página principal del proyecto, localiza la sección **“Comienza agregando Firebase a tu aplicación”**.
2. Clic en el icono **`</>`** (Web).
3. **Apodo de la app**: por ejemplo `Calendario TS`. Deja **Firebase Hosting** sin marcar.
4. Clic en **“Registrar app”**.
5. Firebase te mostrará un bloque de código con un objeto parecido a este:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

6. **Copia** esos seis valores (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId). Los usarás en el Paso 6.
7. Clic en **“Siguiente”** y luego **“Continuar en la consola”**.

---

## Paso 3: Activar Firestore Database

1. En el menú izquierdo: **“Compilación”** → **“Firestore Database”**.
2. Clic en **“Crear base de datos”**.
3. Elige **“Iniciar en modo de producción”** → **“Siguiente”**.
4. **Ubicación**: elige una región cercana (por ejemplo `europe-west1` o `us-central1`) → **“Habilitar”**.
5. Cuando esté creada, ve a la pestaña **“Reglas”** (Rules).
6. **Borra** el contenido actual y pega exactamente esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservations/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

7. Clic en **“Publicar”**.

---

## Paso 4: Activar Authentication (Google)

1. En el menú izquierdo: **“Compilación”** → **“Authentication”**.
2. Clic en **“Comenzar”**.
3. Pestaña **“Sign-in method”** (Método de inicio de sesión).
4. Clic en **“Google”** → activa el **interruptor “Habilitar”**.
5. **Correo de apoyo del proyecto**: puede ser tu correo. Clic en **“Guardar”**.

(Si ya tienes un **Client ID de Google** en Google Cloud para esta app, Firebase usará el mismo proyecto de Google Cloud. Si no, Firebase puede crear uno por ti.)

---

## Paso 5: (Opcional) Ver la config de tu app web

Si no copiaste la config en el Paso 2:

1. Clic en el **engranaje** (Configuración del proyecto) junto a “Descripción general del proyecto”.
2. Baja hasta **“Tus aplicaciones”** y localiza tu app web.
3. Ahí verás de nuevo el objeto `firebaseConfig` con apiKey, authDomain, projectId, etc. Cópialo.

---

## Paso 6: Poner la config en tu proyecto (config.js)

1. Abre el archivo **`config.js`** de tu carpeta del calendario.
2. Localiza el objeto **`window.TACTICAL_SUPPORT_FIREBASE_CONFIG`** (está vacío o con comillas vacías).
3. Pega los valores que copiaste de Firebase, así:

```js
window.TACTICAL_SUPPORT_FIREBASE_CONFIG = {
  apiKey: 'AIza...',              // el apiKey que te dio Firebase
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123...'
};
```

4. **Guarda** el archivo.

---

## Paso 7: Probar

1. Abre tu calendario en el navegador (local o la URL de GitHub Pages).
2. Inicia sesión con Google.
3. Crea una reservación.
4. Abre la **misma URL en otro dispositivo o en otra ventana de incógnito** (sin iniciar sesión): deberías ver la misma reserva.

Si ves la reserva en ambos lados, la app web está correctamente configurada con Firebase.

---

## Resumen rápido

| Paso | Dónde | Qué hacer |
|-----|--------|------------|
| 1 | [Firebase Console](https://console.firebase.google.com/) | Crear proyecto |
| 2 | Mismo proyecto | Agregar app web `</>` y copiar `firebaseConfig` |
| 3 | Firestore Database | Crear base de datos y publicar reglas de `reservations` |
| 4 | Authentication | Habilitar proveedor Google |
| 5 | (Opcional) Configuración del proyecto | Ver/copiar config si hace falta |
| 6 | Tu archivo `config.js` | Rellenar `TACTICAL_SUPPORT_FIREBASE_CONFIG` |
| 7 | Navegador | Probar reservar y ver en otro dispositivo |

Si algo no funciona, revisa la consola del navegador (F12 → pestaña “Consola”) para ver mensajes de error.

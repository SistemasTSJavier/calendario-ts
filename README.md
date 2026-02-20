# TACTICAL SUPPORT — Calendario Sala 2do Piso

Calendario de **Horarios Reservados** con inicio de sesión por Google. Solo los gerentes (usuarios con Google) pueden crear reservaciones; **todos** ven las mismas reservas en cualquier dispositivo.

- **App recomendada (Flutter + Supabase):** en la carpeta **`calendario_app/`** tienes la versión en Flutter con backend en Supabase, tiempo real y soporte móvil/web. Ver `calendario_app/README.md` y `calendario_app/SUPABASE-SETUP.md`.
- **Versión web (HTML/JS + Firebase):** la raíz del repo es la versión clásica para GitHub Pages; con Firebase las reservas se comparten en la nube (ver más abajo).

---

## Publicar online con GitHub (GitHub Pages)

Así tendrás una URL tipo `https://tuusuario.github.io/Calendario` para usar el calendario en línea.

### 1. Crear un repositorio en GitHub

1. Entra en [github.com](https://github.com) e inicia sesión.
2. Clic en **+** (arriba derecha) → **New repository**.
3. **Repository name**: por ejemplo `Calendario` (o el nombre que quieras).
4. Deja **Public** y no marques "Add a README" (ya tienes archivos locales).
5. Clic en **Create repository**.

### 2. Subir tu proyecto desde la carpeta local

Abre **PowerShell** o **Símbolo del sistema** en la carpeta del proyecto (`c:\Users\fjavi\Calendario`) y ejecuta (sustituye `TU_USUARIO` por tu usuario de GitHub):

```bash
git init
git add .
git commit -m "Calendario TACTICAL SUPPORT"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/Calendario.git
git push -u origin main
```

Si te pide usuario y contraseña: en GitHub usa un **Personal Access Token** como contraseña (Settings → Developer settings → Personal access tokens).

### 3. Activar GitHub Pages

1. En GitHub, abre tu repositorio **Calendario**.
2. Ve a **Settings** → en el menú izquierdo **Pages**.
3. En **Source** elige **Deploy from a branch**.
4. En **Branch** elige `main` y carpeta **/ (root)**.
5. **Save**.

En 1–2 minutos tu sitio estará en:

**`https://TU_USUARIO.github.io/Calendario/`**

### 4. Configurar Google Auth para la URL online

Para que "Iniciar sesión con Google" funcione en esa URL:

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) → tu proyecto.
2. **APIs y servicios** → **Credenciales** → abre tu **ID de cliente OAuth 2.0** (tipo Web).
3. En **Orígenes JavaScript autorizados** agrega:
   - `https://TU_USUARIO.github.io`
4. Guarda los cambios.

Así funcionará el login en `https://TU_USUARIO.github.io/Calendario/`.

### Resumen de URLs

| Dónde              | URL |
|--------------------|-----|
| Repositorio        | `https://github.com/TU_USUARIO/Calendario` |
| Calendario online  | `https://TU_USUARIO.github.io/Calendario/`  |

---

## Configuración de Google Auth

1. Entra en [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto o elige uno existente.
3. Ve a **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente OAuth 2.0**.
4. Tipo de aplicación: **Aplicación web**.
5. En **Orígenes JavaScript autorizados** agrega:
   - `http://localhost` (para probar en local)
   - Si usas GitHub Pages: `https://TU_USUARIO.github.io`
   - Si usas otro hosting: la URL de tu sitio (ej. `https://tudominio.com`).
6. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`).
7. En la carpeta del proyecto, abre `config.js` y pega el ID:

```js
window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';
```

---

## Configuración de Firebase (para que todos vean las reservas)

Si no configuras Firebase, las reservas solo se guardan en el mismo navegador (localStorage). Para que **cualquier persona** (otro PC, otro móvil) vea las mismas reservas en tiempo real:

### 1. Crear proyecto Firebase

1. Entra en [Firebase Console](https://console.firebase.google.com/).
2. **Agregar proyecto** (o usa uno existente).
3. Si quieres, activa Google Analytics (opcional). **Continuar** → **Crear proyecto**.

### 2. Registrar la app web

1. En el proyecto, clic en el icono **</>** (Web).
2. **Nombre de la app**: por ejemplo "Calendario TS". No marques Firebase Hosting por ahora.
3. **Registrar app** → copia el objeto `firebaseConfig` que te muestra (apiKey, authDomain, projectId, etc.).

### 3. Activar Firestore

1. En el menú izquierdo: **Compilación** → **Firestore Database**.
2. **Crear base de datos** → modo **Producción** → elegir región (ej. `europe-west1`) → **Habilitar**.
3. Ve a la pestaña **Reglas**. Sustituye las reglas por estas (o pégalas desde el archivo `firestore.rules` del proyecto):

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

4. **Publicar**.

### 4. Activar Authentication (Google)

1. **Compilación** → **Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → **Google** → **Activar** → guardar (usa el mismo proyecto de Google Cloud que ya tienes para el Client ID).

### 5. Poner la config en tu proyecto

En `config.js`, rellena el objeto de Firebase con los datos que copiaste:

```js
window.TACTICAL_SUPPORT_FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123'
};
```

Guarda y vuelve a cargar el calendario. A partir de entonces las reservas se guardan en la nube y **todos los que abran la misma URL verán las mismas reservas**.

---

## Cómo usar

- Abre `index.html` en el navegador (o sirve la carpeta con un servidor local si lo prefieres).
- **Iniciar sesión con Google**: en la esquina superior derecha. Solo así se habilita **+ Nueva reservación**.
- **Reservar**: clic en **+ Nueva reservación** o en un día del calendario (si estás logueado). Completa día, hora, asunto, etc.
- **Ver reservas**: en el calendario solo se muestra la **fecha y hora** de cada reserva (“Hora — Reservado”). Clic en la pastilla para ver detalle (fecha, hora, reservado por).
- **Eliminar**: solo puedes eliminar tus propias reservaciones (mismo email de Google).

**Datos:** Con Firebase configurado, las reservas se guardan en la nube y **todos** las ven en tiempo real en cualquier dispositivo. Sin Firebase, se usan solo en el mismo navegador (`localStorage`).

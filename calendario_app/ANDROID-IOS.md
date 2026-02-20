# Android (ahora) e iOS (después)

La app está lista para **Android** y para **iOS** cuando tengas un Mac. Mismo código, mismo Supabase.

---

## Android

### Probar en dispositivo o emulador

```powershell
cd calendario_app
flutter pub get
flutter run -d android
```

Elige el dispositivo Android que aparezca (emulador o móvil conectado por USB con depuración USB activada).

### Generar APK (para instalar a mano)

```powershell
flutter build apk --release
```

El archivo queda en **`build/app/outputs/flutter-apk/app-release.apk`**. Cópialo al móvil e instálalo (hay que permitir “Instalar desde fuentes desconocidas” si no usas Play Store).

### Generar AAB (para Google Play Store)

Cuando quieras publicar en Play Store:

```powershell
flutter build appbundle --release
```

El archivo queda en **`build/app/outputs/bundle/release/app-release.aab`**. Súbelo en [Google Play Console](https://play.google.com/console).

**Antes de publicar:** configura la firma de release en Android (keystore). Ver: [Flutter – Android release](https://docs.flutter.dev/deployment/android).

---

## iOS (cuando tengas Mac)

Para compilar y desplegar en iOS hace falta:

- **Mac** con **Xcode** instalado.
- Cuenta de **Apple Developer** (99 USD/año) para publicar en App Store.

### En el Mac

1. Instala Flutter y Xcode.
2. En la carpeta del proyecto:
   ```bash
   cd calendario_app
   flutter pub get
   flutter run -d ios
   ```
   (Con un iPhone conectado o un simulador.)
3. Para publicar en App Store: **Xcode** → abrir **`ios/Runner.xcworkspace`** → **Product** → **Archive** y subir a App Store Connect.

El proyecto ya incluye la carpeta **`ios/`** con la configuración y el deep link para auth. No hace falta volver a crear la plataforma iOS.

---

## Resumen

| Plataforma | Ahora | Después |
|------------|--------|---------|
| **Android** | `flutter run -d android`, `flutter build apk` o `appbundle` | Publicar en Play Store con AAB firmado |
| **iOS** | — | En Mac: Xcode + Flutter, luego Archive y App Store Connect |

Login (correo y contraseña) y reservas son los mismos en ambas; todo usa Supabase.

# TACTICAL SUPPORT - Sala 2do Piso (Flutter + Supabase)

App de reservas por día (8:00–18:00), login con **correo y contraseña**, backend en **Supabase**. Pensada para **Android** primero y después **iOS**. **Todos los que entren ven y pueden registrar reservas; el horario se actualiza en tiempo real para todos.**

## Requisitos

- [Flutter SDK](https://docs.flutter.dev/get-started/install) instalado.
- Cuenta en [Supabase](https://supabase.com) y proyecto creado.

## Configuración rápida

1. **Supabase**: crea un proyecto y sigue **SUPABASE-SETUP.md** (tabla `reservations`, RLS, Realtime y usuarios con email).
2. **Config**: en `lib/config/supabase_config.dart` pon tu Project URL y anon key (o usa `--dart-define` en producción).
3. **Ejecutar en Android**:
   ```bash
   cd calendario_app
   flutter pub get
   flutter run -d android
   ```
   (Emulador o móvil conectado por USB.)

**Despliegue interno (solo gerentes):** ver **DESPLIEGUE-INTERNO-GERENTES.md** — dar acceso por correo con Supabase y ver en tiempo real el horario reservado.  
**Android / iOS (builds):** ver **ANDROID-IOS.md** (APK, AAB, iOS en Mac).


## Estructura

| Ruta | Descripción |
|------|-------------|
| `lib/main.dart` | Inicialización Supabase y puerta de auth (StreamBuilder). |
| `lib/screens/` | Login, vista día, formulario reserva, detalle. |
| `lib/services/supabase_service.dart` | Auth, CRUD de reservas y **stream de cambios en tiempo real**. |
| `lib/models/reservation.dart` | Modelo de reserva. |
| `lib/config/supabase_config.dart` | URL y anon key (con soporte opcional para `--dart-define`). |

Las reservas del día se cargan con una consulta por fecha y se actualizan al instante gracias a Supabase Realtime (Postgres Changes).

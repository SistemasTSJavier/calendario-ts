import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/reservation.dart';

/// Servicio central para Supabase: auth, reservas y tiempo real.
class SupabaseService {
  static SupabaseClient get _client => Supabase.instance.client;

  // --- Auth ---
  static String? get currentUserId => _client.auth.currentUser?.id;
  static String? get currentUserEmail => _client.auth.currentUser?.email;

  /// Nombre del usuario para prellenar responsable (email auth puede no tenerlo).
  static String? get currentUserDisplayName {
    final meta = _client.auth.currentUser?.userMetadata;
    if (meta == null) return null;
    return meta['full_name'] as String? ?? meta['name'] as String? ?? currentUserEmail;
  }

  /// Cierra sesión.
  static Future<void> signOut() => _client.auth.signOut();

  // --- Reservas ---

  /// Reservas de un día (fecha YYYY-MM-DD). Filtro en servidor.
  static Future<List<Reservation>> getReservationsForDay(String fecha) async {
    final res = await _client
        .from('reservations')
        .select()
        .eq('fecha', fecha)
        .order('hora');
    return (res as List)
        .map((e) => Reservation.fromMap(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  /// Crea una reserva; el [id] se genera en Supabase. Devuelve la reserva con id.
  static Future<Reservation> createReservation(Reservation r) async {
    final data = r.toMap();
    final res = await _client.from('reservations').insert(data).select().single();
    return Reservation.fromMap(Map<String, dynamic>.from(res as Map));
  }

  static Future<void> deleteReservation(String id) async {
    await _client.from('reservations').delete().eq('id', id);
  }

  /// Stream que emite cuando hay cambios en la tabla reservations (INSERT/UPDATE/DELETE).
  /// Suscríbete en la pantalla principal para refrescar el día al instante.
  static Stream<void> get reservationsChanged {
    late final StreamController<void> controller;
    late final RealtimeChannel channel;
    controller = StreamController<void>.broadcast(onListen: () {
      channel = _client.channel('reservations-changes').onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'reservations',
        callback: (_) => controller.add(null),
      );
      channel.subscribe();
    }, onCancel: () {
      channel.unsubscribe();
    });
    return controller.stream;
  }
}

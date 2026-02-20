/// Configuración de Supabase.
///
/// Copia desde el Dashboard: tu proyecto → Settings → API
/// - Project URL → supabaseUrl (ej. https://xxxx.supabase.co)
/// - anon public (o Publishable key) → supabaseAnonKey
///   Puede ser la clave larga "eyJ..." o la nueva "sb_publishable_..."
///
/// Si el proyecto está pausado, restáuralo desde el Dashboard para que la URL responda.
class SupabaseConfig {
  static const String supabaseUrl = _supabaseUrl;
  static const String supabaseAnonKey = _supabaseAnonKey;

  static const String _supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://oxfodbajjzdxgoirsiqp.supabase.co',
  );
  static const String _supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable_V6bwE06n2mMQjhG_TPaCEA_gf6oE3_4',
  );
}

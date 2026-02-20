import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signInWithEmail(BuildContext context) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      if (mounted) setState(() => _loading = false);
    } on AuthException catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        final isInvalidCreds = e.message.toLowerCase().contains('invalid') ||
            e.message.contains('credentials') ||
            e.message.contains('Invalid login');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isInvalidCreds
                ? 'Correo o contraseña incorrectos. Revisa que el usuario exista en Supabase (Authentication → Users).'
                : e.message),
            backgroundColor: Colors.red.shade700,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Ayuda',
              textColor: Colors.white,
              onPressed: () => _showLoginHelpDialog(context),
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      final msg = e.toString();
      final isConnectionError = msg.contains('Failed host lookup') ||
          msg.contains('SocketException') ||
          msg.contains('No address associated with hostname') ||
          msg.contains('Connection refused');
      if (isConnectionError) {
        _showConnectionErrorDialog(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString().length > 80 ? e.toString().substring(0, 80) + "…" : e}'),
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Ayuda',
              textColor: Colors.white,
              onPressed: () => _showLoginHelpDialog(context),
            ),
          ),
        );
      }
    }
  }

  void _showLoginHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('No puedo iniciar sesión'),
        content: const SingleChildScrollView(
          child: Text(
            '1. Proyecto activo: en supabase.com/dashboard comprueba que el proyecto no esté pausado (Restore project si lo está).\n\n'
            '2. Usuario creado: en Authentication → Users debe existir un usuario con el mismo correo que usas. Add user → Create new user (email + contraseña).\n\n'
            '3. Correo y contraseña: exactamente los que pusiste en Supabase, sin espacios al inicio o final.\n\n'
            '4. Si sigue fallando: en Settings → API prueba a copiar la clave "anon public" larga (empieza por eyJ) en supabase_config.dart en lugar de sb_publishable_...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  void _showConnectionErrorDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('No se pudo conectar'),
        content: const SingleChildScrollView(
          child: Text(
            'No se pudo alcanzar el servidor de Supabase.\n\n'
            '1. Entra en supabase.com/dashboard y comprueba que tu proyecto esté ACTIVO (si está pausado, pulsa "Restore project").\n\n'
            '2. Comprueba que tengas internet en este dispositivo.\n\n'
            '3. En el proyecto: Settings → API. Verifica que "Project URL" y "anon public" coincidan con los de lib/config/supabase_config.dart.',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Entendido'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _showLoginHelpDialog(context);
            },
            child: const Text('Más ayuda'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'TACTICAL SUPPORT',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sala 2do Piso',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Correo',
                    hintText: 'tu@ejemplo.com',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Escribe tu correo';
                    if (!v.contains('@')) return 'Correo no válido';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _signInWithEmail(context),
                  decoration: InputDecoration(
                    labelText: 'Contraseña',
                    border: const OutlineInputBorder(),
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Escribe tu contraseña';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => _showLoginHelpDialog(context),
                  child: const Text('¿No puedes iniciar sesión?'),
                ),
                const SizedBox(height: 8),
                FilledButton(
                  onPressed: _loading ? null : () => _signInWithEmail(context),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _loading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Iniciar sesión'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

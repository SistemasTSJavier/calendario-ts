import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reservation.dart';
import '../services/supabase_service.dart';

class ReservationFormScreen extends StatefulWidget {
  final DateTime initialDate;

  const ReservationFormScreen({super.key, required this.initialDate});

  @override
  State<ReservationFormScreen> createState() => _ReservationFormScreenState();
}

class _ReservationFormScreenState extends State<ReservationFormScreen> {
  late DateTime _fecha;
  late int _hora; // 8..18
  final _responsableController = TextEditingController();
  final _asuntoController = TextEditingController();
  final _participantesController = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _fecha = widget.initialDate;
    _hora = 8;
    _responsableController.text = SupabaseService.currentUserDisplayName ?? '';
  }

  @override
  void dispose() {
    _responsableController.dispose();
    _asuntoController.dispose();
    _participantesController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fecha,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _fecha = picked);
  }

  Future<void> _save() async {
    final responsable = _responsableController.text.trim();
    final asunto = _asuntoController.text.trim();
    if (responsable.isEmpty || asunto.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Responsable y asunto son obligatorios')),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      final r = Reservation(
        id: '',
        fecha: DateFormat('yyyy-MM-dd').format(_fecha),
        hora: '${_hora.toString().padLeft(2, '0')}:00',
        responsable: responsable,
        asunto: asunto,
        participantes: _participantesController.text.trim(),
        reservadoPor: SupabaseService.currentUserEmail ?? '',
      );
      final created = await SupabaseService.createReservation(r);
      if (mounted) Navigator.of(context).pop(created);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al guardar: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva reservación'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _responsableController,
              decoration: const InputDecoration(
                labelText: 'Responsable',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _asuntoController,
              decoration: const InputDecoration(
                labelText: 'Asunto',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('Día'),
              subtitle: Text(DateFormat('d MMMM y', 'es').format(_fecha)),
              trailing: const Icon(Icons.calendar_today),
              onTap: _pickDate,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<int>(
              value: _hora,
              decoration: const InputDecoration(
                labelText: 'Hora (8:00 – 18:00)',
                border: OutlineInputBorder(),
              ),
              items: List.generate(
                hourEnd - hourStart + 1,
                (i) {
                  final h = hourStart + i;
                  return DropdownMenuItem(
                    value: h,
                    child: Text('${h.toString().padLeft(2, '0')}:00'),
                  );
                },
              ),
              onChanged: (v) => setState(() => _hora = v ?? 8),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _participantesController,
              decoration: const InputDecoration(
                labelText: 'Participantes (opcional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Guardar reservación'),
            ),
          ],
        ),
      ),
    );
  }
}

const hourStart = 8;
const hourEnd = 18;

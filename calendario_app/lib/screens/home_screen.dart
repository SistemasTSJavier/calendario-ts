import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reservation.dart';
import '../services/supabase_service.dart';
import 'reservation_form_screen.dart';
import 'reservation_detail_screen.dart';

const int hourStart = 8;
const int hourEnd = 18;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late DateTime _selectedDate;
  List<Reservation> _reservations = [];
  bool _loading = true;
  StreamSubscription<void>? _realtimeSub;
  String get _fechaKey => DateFormat('yyyy-MM-dd').format(_selectedDate);

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _loadDay(fromRealtime: false);
    _realtimeSub = SupabaseService.reservationsChanged.listen((_) {
      if (mounted) _loadDay(fromRealtime: true);
    });
  }

  @override
  void dispose() {
    _realtimeSub?.cancel();
    super.dispose();
  }

  Future<void> _loadDay({bool fromRealtime = false}) async {
    setState(() => _loading = true);
    try {
      final list = await SupabaseService.getReservationsForDay(_fechaKey);
      if (mounted) {
        setState(() {
          _reservations = list;
          _loading = false;
        });
        if (fromRealtime) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Lista actualizada'),
              duration: Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar: $e')),
        );
      }
    }
  }

  List<Reservation> _reservationsForHour(int hour) {
    final prefix = hour.toString().padLeft(2, '0');
    return _reservations.where((r) {
      final h = r.hora.split(':').first;
      return h == prefix || r.hora.startsWith('$prefix:');
    }).toList();
  }

  void _prevDay() {
    setState(() {
      _selectedDate = _selectedDate.subtract(const Duration(days: 1));
      _loadDay(fromRealtime: false);
    });
  }

  void _nextDay() {
    setState(() {
      _selectedDate = _selectedDate.add(const Duration(days: 1));
      _loadDay(fromRealtime: false);
    });
  }

  Future<void> _openNewReservation() async {
    final result = await Navigator.of(context).push<Reservation?>(
      MaterialPageRoute(
        builder: (context) => ReservationFormScreen(initialDate: _selectedDate),
      ),
    );
    if (result != null) {
      await _loadDay(fromRealtime: false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Reservación guardada: ${result.asunto} (${result.fecha} ${result.hora})'),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
      await _openDetail(result);
    }
  }

  Future<void> _openDetail(Reservation r) async {
    final deleted = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => ReservationDetailScreen(reservation: r),
      ),
    );
    if (deleted == true) _loadDay(fromRealtime: false);
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = DateFormat('d \'de\' MMMM \'de\' y', 'es').format(_selectedDate);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Horarios Reservados'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => SupabaseService.signOut(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildToolbar(dateLabel),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _buildDayList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openNewReservation,
        icon: const Icon(Icons.add),
        label: const Text('Nueva reservación'),
      ),
    );
  }

  Widget _buildToolbar(String dateLabel) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: _prevDay,
              ),
              Text(
                dateLabel,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: _nextDay,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDayList() {
    return ListView.builder(
      itemCount: hourEnd - hourStart + 1,
      itemBuilder: (context, index) {
        final hour = hourStart + index;
        final hourLabel = '${hour.toString().padLeft(2, '0')}:00';
        final list = _reservationsForHour(hour);
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ListTile(
            title: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 56,
                  child: Text(
                    hourLabel,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
                Expanded(
                  child: list.isEmpty
                      ? const Text('—', style: TextStyle(color: Colors.grey))
                      : Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: list
                              .map((r) => ActionChip(
                                    label: Text(
                                      '${r.hora} — ${r.asunto}',
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                    onPressed: () => _openDetail(r),
                                  ))
                              .toList(),
                        ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

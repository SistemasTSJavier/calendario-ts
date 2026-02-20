class Reservation {
  final String id;
  final String fecha; // YYYY-MM-DD
  final String hora;  // HH:mm
  final String responsable;
  final String asunto;
  final String participantes;
  final String reservadoPor; // email

  Reservation({
    required this.id,
    required this.fecha,
    required this.hora,
    required this.responsable,
    required this.asunto,
    required this.participantes,
    required this.reservadoPor,
  });

  factory Reservation.fromMap(Map<String, dynamic> map) {
    return Reservation(
      id: map['id'] as String? ?? '',
      fecha: map['fecha'] as String? ?? '',
      hora: map['hora'] as String? ?? '',
      responsable: map['responsable'] as String? ?? '',
      asunto: map['asunto'] as String? ?? '',
      participantes: map['participantes'] as String? ?? '',
      reservadoPor: map['reservado_por'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'fecha': fecha,
      'hora': hora,
      'responsable': responsable,
      'asunto': asunto,
      'participantes': participantes,
      'reservado_por': reservadoPor,
    };
  }
}

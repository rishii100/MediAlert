import 'dart:convert';

class AppointmentModel {
  String? id;
  String doctorId;
  String? doctorName;
  String patientId;
  String? patientName;
  DateTime appointmentDate;
  String startTime;
  String endTime;
  String status;
  DateTime? createdAt;

  AppointmentModel({
    this.id,
    required this.doctorId,
    this.doctorName,
    required this.patientId,
    this.patientName,
    required this.appointmentDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.createdAt,
  });

  factory AppointmentModel.fromRawJson(String str) =>
      AppointmentModel.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json["_id"] ?? json["id"],
      doctorId: json["doctorId"] ?? json["doctor_id"],
      doctorName: json["doctorName"] ?? json["doctor_name"],
      patientId: json["patientId"] ?? json["patient_id"],
      patientName: json["patientName"] ?? json["patient_name"],
      appointmentDate: json["appointmentDate"] != null
          ? DateTime.parse(json["appointmentDate"])
          : DateTime.parse(json["appointment_date"]),
      startTime: json["startTime"] ?? json["start_time"],
      endTime: json["endTime"] ?? json["end_time"] ?? "",
      status: json["status"],
      createdAt: json["createdAt"] != null
          ? DateTime.parse(json["createdAt"])
          : json["created_at"] != null
              ? DateTime.parse(json["created_at"])
              : null,
    );
  }

  Map<String, dynamic> toJson() => {
        "doctorId": doctorId,
        "patientId": patientId,
        "appointmentDate": appointmentDate.toIso8601String().split('T')[0],
        "startTime": startTime,
        "endTime": endTime,
        "status": status,
      };
}

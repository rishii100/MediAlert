import 'dart:convert';

class PatientModel {
  String? id;
  String firstName;
  String lastName;
  String email;
  String? phone;
  String? deviceToken;

  PatientModel({
    this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    this.deviceToken,
  });

  factory PatientModel.fromRawJson(String str) =>
      PatientModel.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory PatientModel.fromJson(Map<String, dynamic> json) => PatientModel(
        id: json["_id"] ?? json["id"],
        firstName: json["firstName"] ?? json["first_name"] ?? "",
        lastName: json["lastName"] ?? json["last_name"] ?? "",
        email: json["email"] ?? "",
        phone: json["phone"],
        deviceToken: json["deviceToken"] ?? json["device_token"],
      );

  Map<String, dynamic> toJson() => {
        "name": "$firstName $lastName",
        "email": email,
        "phone": phone,
        "deviceToken": deviceToken,
      };

  String get name => "$firstName $lastName";
}

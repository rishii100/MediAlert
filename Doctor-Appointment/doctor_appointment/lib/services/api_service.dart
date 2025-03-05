// ignore_for_file: unused_import

import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:doctor_appointment/model/doctor_model.dart';
import 'package:doctor_appointment/model/appointment_model.dart';
import 'package:doctor_appointment/model/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:doctor_appointment/services/auth_service.dart';

class ApiService {
  // Get the base URL based on platform
  static String get baseUrl {
    // For web
    if (kIsWeb) {
      return 'http://localhost:5001/api';
    }

    // For Android emulator
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5001/api';
    }

    // For iOS simulator
    if (Platform.isIOS) {
      return 'http://localhost:5001/api';
    }

    // Default fallback
    return 'http://localhost:5001/api';
  }

  // For physical devices, you can set a custom IP address
  static String? _customIpAddress;

  // Set a custom IP address for physical devices
  static void setCustomIpAddress(String ipAddress) {
    _customIpAddress = ipAddress;
  }

  // Get the actual base URL to use (with custom IP if set)
  static String getEffectiveBaseUrl() {
    if (_customIpAddress != null && _customIpAddress!.isNotEmpty) {
      return 'http://$_customIpAddress:5001/api';
    }
    return baseUrl;
  }

  // Add auth token to headers if available
  static Future<Map<String, String>> _getHeaders() async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    };

    final token = await AuthService.getToken();
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // Check if the server is reachable
  static Future<bool> isServerReachable() async {
    try {
      final response = await http.get(
        Uri.parse('${getEffectiveBaseUrl()}/health'),
        headers: {'Connection': 'keep-alive'},
      ).timeout(Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (e) {
      print('Server reachability check failed: $e');
      return false;
    }
  }

  // Get all doctors
  static Future<List<DoctorModel>> getDoctors({
    String? specialty,
    double? latitude,
    double? longitude,
  }) async {
    try {
      // Check server reachability first
      if (!await isServerReachable()) {
        throw Exception(
            'Server is not reachable. Please check your connection or server status.');
      }

      Map<String, String> queryParams = {};

      if (specialty != null && specialty.isNotEmpty) {
        queryParams['specialty'] = specialty;
      }

      if (latitude != null && longitude != null) {
        queryParams['latitude'] = latitude.toString();
        queryParams['longitude'] = longitude.toString();
      }

      final uri = Uri.parse('${getEffectiveBaseUrl()}/doctors')
          .replace(queryParameters: queryParams);

      print('Fetching doctors from: $uri');
      final response = await http
          .get(
            uri,
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => DoctorModel.fromJson(json)).toList();
      } else {
        print('Error fetching doctors: ${response.statusCode}');
        print('Response body: ${response.body}');
        throw Exception('Failed to load doctors: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in getDoctors: $e');
      if (e is SocketException) {
        throw Exception(
            'Network error: Cannot connect to server. Please check your internet connection.');
      } else if (e is http.ClientException) {
        throw Exception('Network error: Client exception - ${e.message}');
      } else if (e is FormatException) {
        throw Exception(
            'Data format error: Invalid response format from server.');
      } else {
        throw Exception('Network error: $e');
      }
    }
  }

  // Get doctor by ID
  static Future<DoctorModel> getDoctorById(String id) async {
    try {
      final response = await http
          .get(
            Uri.parse('${getEffectiveBaseUrl()}/doctors/$id'),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        return DoctorModel.fromJson(json.decode(response.body));
      } else {
        print('Error fetching doctor: ${response.statusCode}');
        print('Response body: ${response.body}');
        throw Exception(
            'Failed to load doctor details: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in getDoctorById: $e');
      if (e is SocketException) {
        throw Exception(
            'Network error: Cannot connect to server. Please check your internet connection.');
      } else {
        throw Exception('Network error: $e');
      }
    }
  }

  // Get doctor availability
  static Future<List<Map<String, String>>> getDoctorAvailability(
      String doctorId, DateTime date) async {
    try {
      final dateStr =
          "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";
      final response = await http
          .get(
            Uri.parse(
                '${getEffectiveBaseUrl()}/doctors/$doctorId/availability?date=$dateStr'),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data
            .map<Map<String, String>>((slot) => {
                  'start_time': slot['start_time'],
                  'end_time': slot['end_time'],
                })
            .toList();
      } else {
        print('Error fetching availability: ${response.statusCode}');
        print('Response body: ${response.body}');
        throw Exception(
            'Failed to load doctor availability: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in getDoctorAvailability: $e');
      if (e is SocketException) {
        throw Exception(
            'Network error: Cannot connect to server. Please check your internet connection.');
      } else {
        throw Exception('Network error: $e');
      }
    }
  }

  // Book appointment
  static Future<AppointmentModel> bookAppointment(
      AppointmentModel appointment) async {
    try {
      final response = await http
          .post(
            Uri.parse('${getEffectiveBaseUrl()}/appointments'),
            headers: await _getHeaders(),
            body: json.encode(appointment.toJson()),
          )
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 201) {
        final responseData = json.decode(response.body);
        return AppointmentModel.fromJson(responseData['appointment']);
      } else {
        final error = json.decode(response.body);
        print('Error booking appointment: ${response.statusCode}');
        print('Response body: ${response.body}');
        throw Exception(error['message'] ??
            'Failed to book appointment: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in bookAppointment: $e');
      if (e is SocketException) {
        throw Exception(
            'Network error: Cannot connect to server. Please check your internet connection.');
      } else {
        throw Exception('Network error: $e');
      }
    }
  }

  // Get patient appointments
  static Future<List<AppointmentModel>> getPatientAppointments(
      String patientId) async {
    try {
      final response = await http
          .get(
            Uri.parse(
                '${getEffectiveBaseUrl()}/patients/$patientId/appointments'),
            headers: await _getHeaders(),
          )
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => AppointmentModel.fromJson(json)).toList();
      } else {
        print('Error fetching appointments: ${response.statusCode}');
        print('Response body: ${response.body}');
        throw Exception('Failed to load appointments: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in getPatientAppointments: $e');
      if (e is SocketException) {
        throw Exception(
            'Network error: Cannot connect to server. Please check your internet connection.');
      } else {
        throw Exception('Network error: $e');
      }
    }
  }

  // Update appointment status
  static Future<AppointmentModel> updateAppointmentStatus(
      String appointmentId, String status) async {
    try {
      final response = await http
          .put(
            Uri.parse('${getEffectiveBaseUrl()}/appointments/$appointmentId'),
            headers: await _getHeaders(),
            body: json.encode({'status': status}),
          )
          .timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        return AppointmentModel.fromJson(json.decode(response.body));
      } else {
        print('Error updating appointment: ${response.statusCode}');
        print('Response body: ${response.body}');
        throw Exception('Failed to update appointment: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in updateAppointmentStatus: $e');
      if (e is SocketException) {
        throw Exception(
            'Network error: Cannot connect to server. Please check your internet connection.');
      } else {
        throw Exception('Network error: $e');
      }
    }
  }

  // Get current patient ID from shared preferences
  static Future<String?> getCurrentPatientId() async {
    try {
      final userData = await AuthService.getCurrentUser();
      return userData['userId'];
    } catch (e) {
      print('Exception in getCurrentPatientId: $e');
      return null;
    }
  }

  // Health check to verify backend connection
  static Future<bool> checkBackendConnection() async {
    try {
      final response = await http.get(
        Uri.parse('${getEffectiveBaseUrl()}/health'),
        headers: {'Connection': 'keep-alive'},
      ).timeout(Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (e) {
      print('Backend connection check failed: $e');
      return false;
    }
  }

  // Seed the database with test data
  static Future<bool> seedDatabase() async {
    try {
      final response = await http.post(
        Uri.parse('${getEffectiveBaseUrl()}/seed'),
        headers: {'Connection': 'keep-alive'},
      ).timeout(Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (e) {
      print('Database seeding failed: $e');
      return false;
    }
  }
}

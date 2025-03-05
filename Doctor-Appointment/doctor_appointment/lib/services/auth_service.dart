import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:doctor_appointment/services/api_service.dart';

class AuthService {
  // Keys for SharedPreferences
  static const String TOKEN_KEY = 'auth_token';
  static const String USER_ID_KEY = 'user_id';
  static const String USER_FIRST_NAME_KEY = 'user_first_name';
  static const String USER_LAST_NAME_KEY = 'user_last_name';
  static const String USER_PHONE_KEY = 'user_phone';
  static const String USER_EMAIL_KEY = 'user_email';

  // Register a new user
  static Future<Map<String, dynamic>> register(
      String firstName, String lastName, String phone,
      {String? email}) async {
    try {
      // Validate inputs
      if (firstName.isEmpty || lastName.isEmpty || phone.isEmpty) {
        return {
          'success': false,
          'message': 'Please fill in all required fields',
        };
      }

      // Prepare request body
      final Map<String, dynamic> requestBody = {
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
      };

      // Add email if provided
      if (email != null && email.isNotEmpty) {
        requestBody['email'] = email;
      } else {
        // Generate a placeholder email if not provided
        requestBody['email'] = '$firstName.$lastName@example.com';
      }

      print('Registering user with data: $requestBody');

      final response = await http
          .post(
            Uri.parse('${ApiService.getEffectiveBaseUrl()}/auth/register'),
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
            },
            body: json.encode(requestBody),
          )
          .timeout(Duration(seconds: 10));

      final responseData = json.decode(response.body);
      print('Registration response: $responseData');

      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': responseData['message'] ?? 'Registration successful',
          'user': responseData['user'],
          'userId': responseData['userId'],
          'email': email ?? '$firstName.$lastName@example.com',
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      print('Registration error: $e');
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // Send OTP to user's phone or email
  static Future<Map<String, dynamic>> sendOTP(String? phone,
      [String? email]) async {
    try {
      // Validate input
      if ((phone == null || phone.isEmpty) &&
          (email == null || email.isEmpty)) {
        return {
          'success': false,
          'message': 'Please enter your phone number or email',
        };
      }

      print('Sending OTP to: ${phone ?? email}');

      final Map<String, dynamic> requestBody = {};
      if (phone != null && phone.isNotEmpty) {
        requestBody['phone'] = phone;
      }
      if (email != null && email.isNotEmpty) {
        requestBody['email'] = email;
      }

      final response = await http
          .post(
            Uri.parse('${ApiService.getEffectiveBaseUrl()}/auth/send-otp'),
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
            },
            body: json.encode(requestBody),
          )
          .timeout(Duration(seconds: 10));

      final responseData = json.decode(response.body);
      print('Send OTP response: $responseData');

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': responseData['message'] ?? 'OTP sent successfully',
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Failed to send OTP',
        };
      }
    } catch (e) {
      print('Send OTP error: $e');
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // Verify OTP and login
  static Future<Map<String, dynamic>> verifyOTP(String? phone, String otp,
      [String? email]) async {
    try {
      // Validate inputs
      if (otp.isEmpty) {
        return {
          'success': false,
          'message': 'OTP is required',
        };
      }

      if ((phone == null || phone.isEmpty) &&
          (email == null || email.isEmpty)) {
        return {
          'success': false,
          'message': 'Phone number or email is required',
        };
      }

      print('Verifying OTP: $otp for: ${phone ?? email}');

      final Map<String, dynamic> requestBody = {
        'otp': otp,
      };

      if (phone != null && phone.isNotEmpty) {
        requestBody['phone'] = phone;
      }
      if (email != null && email.isNotEmpty) {
        requestBody['email'] = email;
      }

      final response = await http
          .post(
            Uri.parse('${ApiService.getEffectiveBaseUrl()}/auth/verify-otp'),
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
            },
            body: json.encode(requestBody),
          )
          .timeout(Duration(seconds: 10));

      final responseData = json.decode(response.body);
      print('Verify OTP response: $responseData');

      if (response.statusCode == 200) {
        // Save auth data to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(TOKEN_KEY, responseData['token']);
        await prefs.setString(USER_ID_KEY, responseData['user']['_id']);
        await prefs.setString(
            USER_FIRST_NAME_KEY, responseData['user']['firstName']);
        await prefs.setString(
            USER_LAST_NAME_KEY, responseData['user']['lastName']);
        await prefs.setString(USER_PHONE_KEY, responseData['user']['phone']);

        // Save email if available
        if (responseData['user']['email'] != null) {
          await prefs.setString(USER_EMAIL_KEY, responseData['user']['email']);
        }

        return {
          'success': true,
          'message': responseData['message'] ?? 'Login successful',
          'user': responseData['user'],
          'token': responseData['token'],
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Invalid OTP',
        };
      }
    } catch (e) {
      print('Verify OTP error: $e');
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(TOKEN_KEY);
    return token != null && token.isNotEmpty;
  }

  // Get current user data
  static Future<Map<String, String?>> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'userId': prefs.getString(USER_ID_KEY),
      'firstName': prefs.getString(USER_FIRST_NAME_KEY),
      'lastName': prefs.getString(USER_LAST_NAME_KEY),
      'phone': prefs.getString(USER_PHONE_KEY),
      'email': prefs.getString(USER_EMAIL_KEY),
    };
  }

  // Logout user
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(TOKEN_KEY);
    await prefs.remove(USER_ID_KEY);
    await prefs.remove(USER_FIRST_NAME_KEY);
    await prefs.remove(USER_LAST_NAME_KEY);
    await prefs.remove(USER_PHONE_KEY);
    await prefs.remove(USER_EMAIL_KEY);
  }

  // Get auth token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(TOKEN_KEY);
  }
}

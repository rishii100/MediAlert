import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io';

class NotificationService {
  static final FlutterLocalNotificationsPlugin
      _flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  // Initialize notification services
  static Future<void> initialize() async {
    try {
      // Initialize local notifications
      final AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('@mipmap/ic_launcher');

      final DarwinInitializationSettings initializationSettingsIOS =
          DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      final InitializationSettings initializationSettings =
          InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsIOS,
      );

      await _flutterLocalNotificationsPlugin.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );

      // Save device token (a unique identifier for this device)
      await _saveDeviceToken();

      print('Notification service initialized successfully');

      // Print platform-specific notification info
      if (Platform.isAndroid) {
        print('Android notification channel set up');
      } else if (Platform.isIOS) {
        print('iOS notification permissions requested');
      }
    } catch (e) {
      print('Error initializing notification service: $e');
    }
  }

  // Save device token to shared preferences
  static Future<void> _saveDeviceToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      // Generate a simple device token (in a real app, this would be more sophisticated)
      final deviceToken = DateTime.now().millisecondsSinceEpoch.toString();
      await prefs.setString('device_token', deviceToken);
      print('Device token saved: $deviceToken');
    } catch (e) {
      print('Error saving device token: $e');
    }
  }

  // Get device token from shared preferences
  static Future<String?> getDeviceToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('device_token');
      print('Retrieved device token: $token');
      return token;
    } catch (e) {
      print('Error getting device token: $e');
      return null;
    }
  }

  // Show local notification
  static Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    try {
      await _flutterLocalNotificationsPlugin.show(
        0,
        title,
        body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            'doctor_appointment_channel',
            'Doctor Appointment Notifications',
            importance: Importance.max,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(),
        ),
        payload: payload,
      );
      print('Notification shown: $title - $body');
    } catch (e) {
      print('Error showing notification: $e');
    }
  }

  // Handle local notification tap
  static void _onNotificationTapped(NotificationResponse response) async {
    try {
      final String? payload = response.payload;
      print('Notification tapped with payload: $payload');

      if (payload != null && payload.contains('directions_url')) {
        // Extract URL from payload
        final start = payload.indexOf('directions_url') + 15;
        final end = payload.indexOf(',', start);
        final url =
            payload.substring(start, end > start ? end : payload.length - 1);

        if (await canLaunchUrl(Uri.parse(url))) {
          await launchUrl(Uri.parse(url));
          print('Launched URL: $url');
        } else {
          print('Could not launch URL: $url');
        }
      }
    } catch (e) {
      print('Error handling notification tap: $e');
    }
  }
}

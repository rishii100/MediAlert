// ignore_for_file: unused_field

import 'package:flutter/material.dart';
import 'package:doctor_appointment/config/route.dart';
import 'package:doctor_appointment/theme/theme.dart';
import 'package:doctor_appointment/services/notification_service.dart';
import 'package:doctor_appointment/services/api_service.dart';
import 'package:doctor_appointment/services/auth_service.dart';
// ignore: unused_import
import 'package:doctor_appointment/screens/splash_screen.dart';
import 'dart:io';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize notification service
  await NotificationService.initialize();

  // You can set a custom IP address here for physical devices
  // Uncomment and set your server IP address if testing on a physical device
  // ApiService.setCustomIpAddress('192.168.1.100');

  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _isBackendConnected = false;
  bool _isChecking = true;
  String _connectionError = '';
  int _retryCount = 0;
  final int _maxRetries = 3;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkBackendConnection();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final isLoggedIn = await AuthService.isLoggedIn();
    setState(() {
      _isLoggedIn = isLoggedIn;
    });
  }

  Future<void> _checkBackendConnection() async {
    try {
      setState(() {
        _isChecking = true;
        _connectionError = '';
      });

      // Print the platform and base URL for debugging
      String platform = Platform.isAndroid
          ? 'Android'
          : Platform.isIOS
              ? 'iOS'
              : 'Unknown';
      print('Running on $platform platform');
      print('Using API base URL: ${ApiService.getEffectiveBaseUrl()}');

      final isConnected = await ApiService.checkBackendConnection();

      if (isConnected) {
        // Try to seed the database if connected
        await ApiService.seedDatabase();
        _retryCount = 0; // Reset retry count on success
      } else if (_retryCount < _maxRetries) {
        // Auto-retry a few times
        _retryCount++;
        print('Connection failed, retrying ($_retryCount/$_maxRetries)...');
        await Future.delayed(Duration(seconds: 2));
        return _checkBackendConnection();
      }

      setState(() {
        _isBackendConnected = isConnected;
        _isChecking = false;
      });
    } catch (e) {
      setState(() {
        _isBackendConnected = false;
        _isChecking = false;
        _connectionError = e.toString();
      });
      print('Connection check error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'MediAlert',
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: Routes.getRoute(),
      onGenerateRoute: (settings) => Routes.onGenerateRoute(settings),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:doctor_appointment/screens/detail_screen.dart';
import 'package:doctor_appointment/screens/home_page_screen.dart';
import 'package:doctor_appointment/screens/my_appointments_screen.dart';
import 'package:doctor_appointment/screens/appointment_screen.dart';
import 'package:doctor_appointment/screens/appointment_confirmation_screen.dart';
import 'package:doctor_appointment/screens/splash_screen.dart';
import 'package:doctor_appointment/screens/login_screen.dart';
import 'package:doctor_appointment/screens/register_screen.dart';
import 'package:doctor_appointment/screens/profile_screen.dart';
import 'package:doctor_appointment/widgets/custom_route_widget.dart';
import 'package:doctor_appointment/model/doctor_model.dart';
import 'package:doctor_appointment/services/auth_service.dart';

class Routes {
  static Map<String, WidgetBuilder> getRoute() {
    return <String, WidgetBuilder>{
      '/': (_) => SplashScreen(),
      '/HomePage': (_) => HomePageScreen(),
      '/MyAppointments': (_) => MyAppointmentsScreen(),
      '/Login': (context) {
        final args = ModalRoute.of(context)?.settings.arguments;
        if (args != null && args is Map<String, dynamic>) {
          return LoginScreen(
            onLoginSuccess: args['onLoginSuccess'],
          );
        }
        return LoginScreen();
      },
      '/Register': (context) {
        final args = ModalRoute.of(context)?.settings.arguments;
        if (args != null && args is Map<String, dynamic>) {
          return RegisterScreen(
            onRegisterSuccess: args['onRegisterSuccess'],
          );
        }
        return RegisterScreen();
      },
      '/Profile': (_) => ProfileScreen(),
    };
  }

  static Route onGenerateRoute(RouteSettings settings) {
    final List<String> pathElements = settings.name!.split('/');
    if (pathElements[0] != '' || pathElements.length == 1) {
      return MaterialPageRoute(builder: (_) => SplashScreen());
    }
    switch (pathElements[1]) {
      case "DetailPage":
        return CustomRoute<bool>(
          builder: (BuildContext context) => DetailScreen(
            model: settings.arguments as DoctorModel,
          ),
        );
      case "AppointmentPage":
        final args = settings.arguments as Map<String, dynamic>;
        return CustomRoute<bool>(
          builder: (BuildContext context) => AppointmentScreen(
            doctor: args['doctor'] as DoctorModel,
          ),
        );
      case "AppointmentConfirmation":
        final args = settings.arguments as Map<String, dynamic>;
        return CustomRoute<bool>(
          builder: (BuildContext context) => AppointmentConfirmationScreen(
            doctor: args['doctor'] as DoctorModel,
            date: args['date'] as DateTime,
            time: args['time'] as String,
          ),
        );
      default:
        return MaterialPageRoute(builder: (_) => SplashScreen());
    }
  }

  // Helper method to check if user is logged in
  static Future<bool> isUserLoggedIn() async {
    return await AuthService.isLoggedIn();
  }
}

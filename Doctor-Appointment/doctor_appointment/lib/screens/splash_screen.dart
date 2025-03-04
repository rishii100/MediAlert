import 'package:doctor_appointment/theme/extention.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(Duration(seconds: 2), () {
      Navigator.pushReplacementNamed(context, '/HomePage');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LightColor.purple,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.medical_services,
              size: 80,
              color: Colors.white,
            ),
            SizedBox(height: 20),
            Text(
              'Doctor Appointment',
              style: TextStyles.h1Style.white,
            ),
            SizedBox(height: 10),
            Text(
              'Book your doctor appointment easily',
              style: TextStyles.body.white,
            ),
          ],
        ),
      ),
    );
  }
}

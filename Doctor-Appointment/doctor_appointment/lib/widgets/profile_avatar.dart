import 'package:flutter/material.dart';
import 'package:doctor_appointment/services/auth_service.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/screens/login_screen.dart';
import 'package:doctor_appointment/screens/profile_screen.dart';
import 'package:doctor_appointment/screens/register_screen.dart';

class ProfileAvatar extends StatefulWidget {
  const ProfileAvatar({Key? key}) : super(key: key);

  @override
  _ProfileAvatarState createState() => _ProfileAvatarState();
}

class _ProfileAvatarState extends State<ProfileAvatar> {
  bool _isLoggedIn = false;
  String _initials = '';

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final isLoggedIn = await AuthService.isLoggedIn();

    if (isLoggedIn) {
      final userData = await AuthService.getCurrentUser();
      final firstName = userData['firstName'] ?? '';
      final lastName = userData['lastName'] ?? '';

      setState(() {
        _isLoggedIn = true;
        _initials = firstName.isNotEmpty && lastName.isNotEmpty
            ? '${firstName[0]}${lastName[0]}'
            : '';
      });
    } else {
      setState(() {
        _isLoggedIn = false;
        _initials = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (_isLoggedIn) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ProfileScreen()),
          ).then((_) => _checkLoginStatus());
        } else {
          _showProfileLoginSheet(context);
        }
      },
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: _isLoggedIn
              ? LightColor.purple.withOpacity(0.2)
              : Colors.grey.withOpacity(0.2),
          shape: BoxShape.circle,
        ),
        child: _isLoggedIn
            ? Center(
                child: Text(
                  _initials,
                  style: TextStyle(
                    color: LightColor.purple,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              )
            : Icon(
                Icons.person,
                color: LightColor.grey,
              ),
      ),
    );
  }

  void _showProfileLoginSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(25),
              topRight: Radius.circular(25),
            ),
          ),
          child: Column(
            children: [
              Container(
                margin: EdgeInsets.only(top: 10),
                width: 50,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              SizedBox(height: 20),
              CircleAvatar(
                radius: 50,
                backgroundColor: LightColor.purple.withOpacity(0.2),
                child: Icon(
                  Icons.person,
                  size: 50,
                  color: LightColor.purple,
                ),
              ),
              SizedBox(height: 20),
              Text(
                'Welcome to Doctor Appointment',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 30),
                child: Text(
                  'Sign in to access your profile, view your appointments, and manage your healthcare needs',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
              ),
              SizedBox(height: 40),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 30),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => LoginScreen(
                          onLoginSuccess: () {
                            _checkLoginStatus();
                            Navigator.of(context).pushNamedAndRemoveUntil(
                                '/HomePage', (route) => false);
                          },
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: LightColor.purple,
                    padding: EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    minimumSize: Size(double.infinity, 50),
                  ),
                  child: Text(
                    'Login',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 15),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 30),
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RegisterScreen(
                          onRegisterSuccess: () {
                            _checkLoginStatus();
                          },
                        ),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: LightColor.purple),
                    padding: EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    minimumSize: Size(double.infinity, 50),
                  ),
                  child: Text(
                    'Create Account',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: LightColor.purple,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 30),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/HomePage');
                },
                child: Text(
                  'Continue as Guest',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:doctor_appointment/services/auth_service.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';
import 'package:doctor_appointment/theme/extention.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, String?> _userData = {
    'firstName': '',
    'lastName': '',
    'phone': '',
  };
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final userData = await AuthService.getCurrentUser();
      setState(() {
        _userData = userData;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading user data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    try {
      await AuthService.logout();
      Navigator.of(context).pushReplacementNamed('/HomePage');
    } catch (e) {
      print('Error during logout: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error during logout: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: BackButton(color: LightColor.purple),
        title: Text(
          'My Profile',
          style: TextStyles.title.copyWith(color: LightColor.purple),
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    SizedBox(height: 20),
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: LightColor.purple.withOpacity(0.2),
                      child: Text(
                        _userData['firstName']?.isNotEmpty == true
                            ? '${_userData['firstName']![0]}${_userData['lastName']![0]}'
                            : 'NA',
                        style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: LightColor.purple,
                        ),
                      ),
                    ),
                    SizedBox(height: 20),
                    Text(
                      '${_userData['firstName'] ?? ''} ${_userData['lastName'] ?? ''}',
                      style: TextStyles.h1Style,
                    ),
                    SizedBox(height: 10),
                    Text(
                      _userData['phone'] ?? '',
                      style: TextStyles.body.subTitleColor,
                    ),
                    SizedBox(height: 40),
                    _buildProfileCard(
                      title: 'Personal Information',
                      children: [
                        _buildInfoRow(
                          icon: Icons.person,
                          title: 'First Name',
                          value: _userData['firstName'] ?? '',
                        ),
                        Divider(),
                        _buildInfoRow(
                          icon: Icons.person,
                          title: 'Last Name',
                          value: _userData['lastName'] ?? '',
                        ),
                        Divider(),
                        _buildInfoRow(
                          icon: Icons.phone,
                          title: 'Phone Number',
                          value: _userData['phone'] ?? '',
                        ),
                      ],
                    ),
                    SizedBox(height: 20),
                    _buildProfileCard(
                      title: 'App Settings',
                      children: [
                        _buildSettingRow(
                          icon: Icons.notifications,
                          title: 'Notifications',
                          trailing: Switch(
                            value: true,
                            onChanged: (value) {},
                            activeColor: LightColor.purple,
                          ),
                        ),
                        Divider(),
                        _buildSettingRow(
                          icon: Icons.language,
                          title: 'Language',
                          trailing: Text('English'),
                        ),
                      ],
                    ),
                    SizedBox(height: 30),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _logout,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text(
                          'Logout',
                          style: TextStyles.titleNormal.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildProfileCard({
    required String title,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyles.title.bold,
            ),
            SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: LightColor.purple),
          SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyles.bodySm.subTitleColor,
              ),
              SizedBox(height: 4),
              Text(
                value,
                style: TextStyles.body,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSettingRow({
    required IconData icon,
    required String title,
    required Widget trailing,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: LightColor.purple),
          SizedBox(width: 16),
          Expanded(
            child: Text(
              title,
              style: TextStyles.body,
            ),
          ),
          trailing,
        ],
      ),
    );
  }
}

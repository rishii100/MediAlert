import 'package:doctor_appointment/theme/extention.dart';
import 'package:flutter/material.dart';
import 'package:doctor_appointment/model/doctor_model.dart';
import 'package:doctor_appointment/model/appointment_model.dart';
import 'package:doctor_appointment/services/api_service.dart';
import 'package:doctor_appointment/services/auth_service.dart';
import 'package:doctor_appointment/services/notification_service.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';
import 'package:intl/intl.dart';
import 'dart:io';

class AppointmentConfirmationScreen extends StatefulWidget {
  final DoctorModel doctor;
  final DateTime date;
  final String time;

  const AppointmentConfirmationScreen({
    Key? key,
    required this.doctor,
    required this.date,
    required this.time,
  }) : super(key: key);

  @override
  _AppointmentConfirmationScreenState createState() =>
      _AppointmentConfirmationScreenState();
}

class _AppointmentConfirmationScreenState
    extends State<AppointmentConfirmationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    // Print platform info
    String platform = Platform.isAndroid
        ? 'Android'
        : Platform.isIOS
            ? 'iOS'
            : 'Unknown';
    print('Appointment confirmation screen initialized on $platform platform');
    print('Using API base URL: ${ApiService.getEffectiveBaseUrl()}');
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final userData = await AuthService.getCurrentUser();
      if (userData['userId'] != null) {
        setState(() {
          _nameController.text =
              '${userData['firstName']} ${userData['lastName']}';
          _phoneController.text = userData['phone'] ?? '';
          _emailController.text = userData['email'] ?? '';
        });
      }
    } catch (e) {
      print('Error loading user data: $e');
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _confirmAppointment() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      // Get device token for notifications
      // ignore: unused_local_variable
      final deviceToken = await NotificationService.getDeviceToken();

      // Get current patient ID
      final patientId = await ApiService.getCurrentPatientId();

      if (patientId == null) {
        throw Exception('You need to be logged in to book an appointment');
      }

      // Create appointment
      final appointment = AppointmentModel(
        doctorId: widget.doctor.id!,
        patientId: patientId,
        appointmentDate: widget.date,
        startTime: widget.time,
        endTime: '', // The backend will calculate this
        status: 'scheduled',
      );

      print('Booking appointment: ${appointment.toRawJson()}');
      final bookedAppointment = await ApiService.bookAppointment(appointment);
      print('Appointment booked with ID: ${bookedAppointment.id}');

      setState(() {
        _isLoading = false;
      });

      // Show success message and navigate back to home
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Appointment booked successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      // Show a local notification
      await NotificationService.showNotification(
        title: 'Appointment Confirmed',
        body:
            'Your appointment with ${widget.doctor.name} on ${DateFormat('EEEE, MMMM d').format(widget.date)} at ${widget.time} has been confirmed.',
      );

      // Navigate to home after a short delay
      Future.delayed(Duration(seconds: 2), () {
        Navigator.popUntil(context, ModalRoute.withName('/HomePage'));
      });
    } catch (e) {
      print('Error booking appointment: $e');
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to book appointment: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
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
          'Confirm Appointment',
          style: TextStyles.title.copyWith(color: LightColor.purple),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildAppointmentDetails(),
              SizedBox(height: 24),
              Text(
                'Your Information',
                style: TextStyles.title.bold,
              ),
              SizedBox(height: 16),
              _buildPatientForm(),
              if (_errorMessage.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Text(
                    _errorMessage,
                    style: TextStyle(color: Colors.red),
                  ),
                ),
              SizedBox(height: 24),
              _buildConfirmButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentDetails() {
    final dateFormat = DateFormat('EEEE, MMMM d, yyyy');

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
              'Appointment Details',
              style: TextStyles.title.bold,
            ),
            SizedBox(height: 16),
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(
                    widget.doctor.image,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.doctor.name,
                        style: TextStyles.title.bold,
                      ),
                      SizedBox(height: 4),
                      Text(
                        widget.doctor.type,
                        style: TextStyles.bodySm.subTitleColor,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.calendar_today, color: LightColor.purple),
                SizedBox(width: 8),
                Text(
                  dateFormat.format(widget.date),
                  style: TextStyles.body,
                ),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, color: LightColor.purple),
                SizedBox(width: 8),
                Text(
                  widget.time,
                  style: TextStyles.body,
                ),
              ],
            ),
            if (widget.doctor.address != null) ...[
              SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.location_on, color: LightColor.purple),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.doctor.address!,
                      style: TextStyles.body,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPatientForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _nameController,
            decoration: InputDecoration(
              labelText: 'Full Name',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              prefixIcon: Icon(Icons.person, color: LightColor.purple),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your name';
              }
              return null;
            },
          ),
          SizedBox(height: 16),
          TextFormField(
            controller: _emailController,
            decoration: InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              prefixIcon: Icon(Icons.email, color: LightColor.purple),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                  .hasMatch(value)) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),
          SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            decoration: InputDecoration(
              labelText: 'Phone Number',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              prefixIcon: Icon(Icons.phone, color: LightColor.purple),
            ),
            keyboardType: TextInputType.phone,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your phone number';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _confirmAppointment,
        style: ElevatedButton.styleFrom(
          backgroundColor: LightColor.purple,
          padding: EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: _isLoading
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  ),
                  SizedBox(width: 10),
                  Text(
                    'Processing...',
                    style: TextStyles.titleNormal.white,
                  ),
                ],
              )
            : Text(
                'Confirm Appointment',
                style: TextStyles.titleNormal.white,
              ),
      ),
    );
  }
}

import 'package:doctor_appointment/theme/extention.dart';
import 'package:flutter/material.dart';
import 'package:doctor_appointment/model/appointment_model.dart';
import 'package:doctor_appointment/services/api_service.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io';

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({Key? key}) : super(key: key);

  @override
  _MyAppointmentsScreenState createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> {
  List<AppointmentModel> _appointments = [];
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  String? _patientId;

  @override
  void initState() {
    super.initState();
    // Print platform info
    String platform = Platform.isAndroid
        ? 'Android'
        : Platform.isIOS
            ? 'iOS'
            : 'Unknown';
    print('My appointments screen initialized on $platform platform');
    print('Using API base URL: ${ApiService.getEffectiveBaseUrl()}');

    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
      _errorMessage = '';
    });

    try {
      // Get current patient ID
      _patientId = await ApiService.getCurrentPatientId();
      print('Current patient ID: $_patientId');

      if (_patientId != null) {
        final appointments =
            await ApiService.getPatientAppointments(_patientId!);
        print('Loaded ${appointments.length} appointments');

        setState(() {
          _appointments = appointments;
          _isLoading = false;
        });
      } else {
        print('No patient ID found');
        setState(() {
          _appointments = [];
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading appointments: $e');
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = e.toString();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load appointments: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _cancelAppointment(String appointmentId) async {
    try {
      print('Cancelling appointment: $appointmentId');
      await ApiService.updateAppointmentStatus(appointmentId, 'cancelled');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Appointment cancelled successfully')),
      );

      _loadAppointments();
    } catch (e) {
      print('Error cancelling appointment: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to cancel appointment: ${e.toString()}'),
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
          'My Appointments',
          style: TextStyles.title.copyWith(color: LightColor.purple),
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _hasError
              ? _buildErrorView()
              : _patientId == null
                  ? _buildNoPatientView()
                  : _appointments.isEmpty
                      ? _buildEmptyView()
                      : _buildAppointmentsList(),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 80,
              color: Colors.red,
            ),
            SizedBox(height: 16),
            Text(
              'Error Loading Appointments',
              style: TextStyles.title,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              _errorMessage,
              style: TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadAppointments,
              style: ElevatedButton.styleFrom(
                backgroundColor: LightColor.purple,
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                'Retry',
                style: TextStyles.titleNormal.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoPatientView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.person_off,
              size: 80,
              color: LightColor.grey,
            ),
            SizedBox(height: 16),
            Text(
              'You need to book an appointment first',
              style: TextStyles.title,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              'Go back to the home screen and book an appointment with a doctor',
              style: TextStyles.body.subTitleColor,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: LightColor.purple,
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                'Go to Home',
                style: TextStyles.titleNormal.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.calendar_today,
              size: 80,
              color: LightColor.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No Appointments Yet',
              style: TextStyles.title,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              'You haven\'t booked any appointments yet',
              style: TextStyles.body.subTitleColor,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: LightColor.purple,
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                'Book an Appointment',
                style: TextStyles.titleNormal.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentsList() {
    final dateFormat = DateFormat('EEEE, MMMM d, yyyy');

    // Group appointments by date
    Map<String, List<AppointmentModel>> groupedAppointments = {};

    for (var appointment in _appointments) {
      final dateStr = dateFormat.format(appointment.appointmentDate);
      if (!groupedAppointments.containsKey(dateStr)) {
        groupedAppointments[dateStr] = [];
      }
      groupedAppointments[dateStr]!.add(appointment);
    }

    return RefreshIndicator(
      onRefresh: _loadAppointments,
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: groupedAppointments.length,
        itemBuilder: (context, index) {
          final date = groupedAppointments.keys.elementAt(index);
          final appointments = groupedAppointments[date]!;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Text(
                  date,
                  style: TextStyles.title.bold,
                ),
              ),
              ...appointments
                  .map((appointment) => _buildAppointmentCard(appointment))
                  .toList(),
              SizedBox(height: 16),
            ],
          );
        },
      ),
    );
  }

  Widget _buildAppointmentCard(AppointmentModel appointment) {
    final isPast = appointment.appointmentDate
        .isBefore(DateTime.now().subtract(Duration(hours: 1)));
    final isToday = appointment.appointmentDate.day == DateTime.now().day &&
        appointment.appointmentDate.month == DateTime.now().month &&
        appointment.appointmentDate.year == DateTime.now().year;

    Color statusColor;
    switch (appointment.status) {
      case 'scheduled':
        statusColor = Colors.green;
        break;
      case 'cancelled':
        statusColor = Colors.red;
        break;
      case 'completed':
        statusColor = Colors.blue;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Card(
      elevation: 4,
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  appointment.doctorName ?? 'Doctor',
                  style: TextStyles.title.bold,
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    appointment.status.toUpperCase(),
                    style: TextStyles.bodySm.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, size: 16, color: LightColor.grey),
                SizedBox(width: 4),
                Text(
                  '${appointment.startTime} - ${appointment.endTime}',
                  style: TextStyles.body,
                ),
              ],
            ),
            SizedBox(height: 16),
            if (appointment.status == 'scheduled' && !isPast)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  OutlinedButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text('Cancel Appointment'),
                          content: Text(
                              'Are you sure you want to cancel this appointment?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: Text('No'),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context);
                                _cancelAppointment(appointment.id!);
                              },
                              child: Text('Yes'),
                            ),
                          ],
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: BorderSide(color: Colors.red),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Cancel'),
                  ),
                  if (isToday)
                    ElevatedButton(
                      onPressed: () {
                        // Launch maps with directions
                        // This is a placeholder - in a real app, you would use the doctor's coordinates
                        launchUrl(Uri.parse(
                            'https://www.google.com/maps/dir/?api=1&destination=doctor+office'));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: LightColor.purple,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text('Get Directions'),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

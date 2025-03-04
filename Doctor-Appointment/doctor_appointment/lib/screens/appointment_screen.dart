import 'package:flutter/material.dart';
import 'package:doctor_appointment/model/doctor_model.dart';
import 'package:doctor_appointment/services/api_service.dart';
import 'package:doctor_appointment/services/auth_service.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';
import 'package:doctor_appointment/theme/extention.dart';
import 'package:table_calendar/table_calendar.dart';
import 'dart:io';
// ignore: unused_import
import 'package:intl/intl.dart';

class AppointmentScreen extends StatefulWidget {
  final DoctorModel doctor;

  const AppointmentScreen({Key? key, required this.doctor}) : super(key: key);

  @override
  _AppointmentScreenState createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen> {
  late DateTime _selectedDay;
  late DateTime _focusedDay;
  List<Map<String, String>> _availableTimeSlots = [];
  String? _selectedTimeSlot;
  bool _isLoading = false;
  bool _hasError = false;
  String _errorMessage = '';
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    // Print platform info
    String platform = Platform.isAndroid
        ? 'Android'
        : Platform.isIOS
            ? 'iOS'
            : 'Unknown';
    print('Appointment screen initialized on $platform platform');
    print('Using API base URL: ${ApiService.getEffectiveBaseUrl()}');

    _selectedDay = DateTime.now();
    _focusedDay = DateTime.now();
    _checkLoginStatus();
    _loadAvailableTimeSlots();
  }

  Future<void> _checkLoginStatus() async {
    final isLoggedIn = await AuthService.isLoggedIn();
    setState(() {
      _isLoggedIn = isLoggedIn;
    });
  }

  Future<void> _loadAvailableTimeSlots() async {
    setState(() {
      _isLoading = true;
      _selectedTimeSlot = null;
      _hasError = false;
      _errorMessage = '';
    });

    try {
      print(
          'Loading time slots for doctor ${widget.doctor.id} on ${_selectedDay.toString()}');
      final slots = await ApiService.getDoctorAvailability(
        widget.doctor.id!,
        _selectedDay,
      );

      print('Loaded ${slots.length} time slots');
      setState(() {
        _availableTimeSlots = slots;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading time slots: $e');
      setState(() {
        _availableTimeSlots = [];
        _isLoading = false;
        _hasError = true;
        _errorMessage = e.toString();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load available time slots: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 5),
          action: SnackBarAction(
            label: 'Retry',
            onPressed: _loadAvailableTimeSlots,
            textColor: Colors.white,
          ),
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
          'Book Appointment',
          style: TextStyles.title.copyWith(color: LightColor.purple),
        ),
      ),
      body: Column(
        children: [
          _buildDoctorInfo(),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildCalendar(),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      'Available Time Slots',
                      style: TextStyles.title.bold,
                    ),
                  ),
                  _isLoading
                      ? Center(child: CircularProgressIndicator())
                      : _hasError
                          ? _buildErrorView()
                          : _buildTimeSlots(),
                ],
              ),
            ),
          ),
          _buildBottomButton(),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(
              Icons.error_outline,
              size: 40,
              color: Colors.red,
            ),
            SizedBox(height: 10),
            Text(
              'Error loading time slots',
              style: TextStyles.body.subTitleColor,
            ),
            SizedBox(height: 5),
            Text(
              _errorMessage,
              style: TextStyle(color: Colors.red, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: _loadAvailableTimeSlots,
              child: Text("Retry"),
              style: ElevatedButton.styleFrom(
                backgroundColor: LightColor.purple,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorInfo() {
    return Container(
      padding: EdgeInsets.all(16),
      child: Row(
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
    );
  }

  Widget _buildCalendar() {
    return TableCalendar(
      firstDay: DateTime.now(),
      lastDay: DateTime.now().add(Duration(days: 30)),
      focusedDay: _focusedDay,
      calendarFormat: CalendarFormat.week,
      selectedDayPredicate: (day) {
        return isSameDay(_selectedDay, day);
      },
      onDaySelected: (selectedDay, focusedDay) {
        setState(() {
          _selectedDay = selectedDay;
          _focusedDay = focusedDay;
        });
        _loadAvailableTimeSlots();
      },
      headerStyle: HeaderStyle(
        formatButtonVisible: false,
        titleCentered: true,
        titleTextStyle: TextStyles.title.bold,
      ),
      calendarStyle: CalendarStyle(
        selectedDecoration: BoxDecoration(
          color: LightColor.purple,
          shape: BoxShape.circle,
        ),
        todayDecoration: BoxDecoration(
          color: LightColor.purple.withOpacity(0.5),
          shape: BoxShape.circle,
        ),
      ),
    );
  }

  Widget _buildTimeSlots() {
    if (_availableTimeSlots.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'No available time slots for this day',
            style: TextStyles.body.subTitleColor,
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: _availableTimeSlots.map((slot) {
          final isSelected = _selectedTimeSlot == slot['start_time'];
          return InkWell(
            onTap: () {
              setState(() {
                _selectedTimeSlot = slot['start_time'];
              });
            },
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? LightColor.purple : Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? LightColor.purple : LightColor.grey,
                ),
              ),
              child: Text(
                slot['start_time']!,
                style: TextStyles.body.copyWith(
                  color: isSelected ? Colors.white : LightColor.titleTextColor,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBottomButton() {
    return Container(
      padding: EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: _selectedTimeSlot == null || !_isLoggedIn
            ? null
            : () {
                Navigator.pushNamed(
                  context,
                  '/AppointmentConfirmation',
                  arguments: {
                    'doctor': widget.doctor,
                    'date': _selectedDay,
                    'time': _selectedTimeSlot,
                  },
                );
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: LightColor.purple,
          padding: EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          minimumSize: Size(double.infinity, 50),
        ),
        child: Text(
          _isLoggedIn ? 'Continue' : 'Login Required to Book',
          style: TextStyles.titleNormal.white,
        ),
      ),
    );
  }
}

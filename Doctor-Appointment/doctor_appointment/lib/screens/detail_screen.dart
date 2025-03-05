import 'package:flutter/material.dart';
import 'package:doctor_appointment/model/doctor_model.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';
import 'package:doctor_appointment/theme/theme.dart';
import 'package:doctor_appointment/widgets/progress_widget.dart';
import 'package:doctor_appointment/widgets/rating_star_widget.dart';
import 'package:doctor_appointment/theme/extention.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:map_launcher/map_launcher.dart';
import 'package:doctor_appointment/services/auth_service.dart';
import 'package:doctor_appointment/screens/login_screen.dart';

class DetailScreen extends StatefulWidget {
  final DoctorModel model;
  DetailScreen({
    Key? key,
    required this.model,
  }) : super(key: key);

  @override
  _DetailPageState createState() => _DetailPageState();
}

class _DetailPageState extends State<DetailScreen> {
  late DoctorModel model;
  bool _isLoggedIn = false;

  @override
  void initState() {
    model = widget.model;
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final isLoggedIn = await AuthService.isLoggedIn();
    setState(() {
      _isLoggedIn = isLoggedIn;
    });
  }

  Widget _appbar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        BackButton(
          color: Theme.of(context).primaryColor,
        ),
        IconButton(
          icon: Icon(
            model.isfavourite ? Icons.favorite : Icons.favorite_border,
            color: model.isfavourite ? Colors.red : LightColor.grey,
          ),
          onPressed: () {
            setState(() {
              model.isfavourite = !model.isfavourite;
            });
          },
        )
      ],
    );
  }

  void _openMaps() async {
    if (model.latitude != null && model.longitude != null) {
      final availableMaps = await MapLauncher.installedMaps;

      if (availableMaps.isNotEmpty) {
        await availableMaps.first.showMarker(
          coords: Coords(model.latitude!, model.longitude!),
          title: model.name,
          description: model.address ?? '',
        );
      }
    }
  }

  void _makePhoneCall() async {
    // This is a placeholder - in a real app, you would store the doctor's phone number
    const phoneNumber = 'tel:+1-555-555-5555';
    if (await canLaunchUrl(Uri.parse(phoneNumber))) {
      await launchUrl(Uri.parse(phoneNumber));
    }
  }

  void _handleAppointmentBooking() async {
    if (_isLoggedIn) {
      // User is logged in, proceed to appointment page
      Navigator.pushNamed(
        context,
        "/AppointmentPage",
        arguments: {'doctor': model},
      );
    } else {
      // User is not logged in, show login prompt
      _showLoginDialog();
    }
  }

  void _showLoginDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Login Required'),
          content: Text(
              'You need to be logged in to book an appointment. Would you like to login or register?'),
          actions: <Widget>[
            TextButton(
              child: Text('Cancel'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Register'),
              onPressed: () {
                Navigator.of(context).pop();
                _navigateToRegister();
              },
            ),
            TextButton(
              child: Text('Login'),
              onPressed: () {
                Navigator.of(context).pop();
                _navigateToLogin();
              },
            ),
          ],
        );
      },
    );
  }

  void _navigateToLogin() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LoginScreen(
          onLoginSuccess: () {
            setState(() {
              _isLoggedIn = true;
            });
            // Navigate to home page after successful login
            Navigator.of(context)
                .pushNamedAndRemoveUntil('/HomePage', (route) => false);
          },
        ),
      ),
    );
  }

  void _navigateToRegister() {
    Navigator.pushNamed(
      context,
      '/Register',
      arguments: {
        'onRegisterSuccess': () {
          setState(() {
            _isLoggedIn = true;
          });
          // After successful registration and login, navigate to home page
          Navigator.of(context)
              .pushNamedAndRemoveUntil('/HomePage', (route) => false);
        },
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    TextStyle titleStyle = TextStyles.title.copyWith(fontSize: 25).bold;
    if (AppTheme.fullWidth(context) < 393) {
      titleStyle = TextStyles.title.copyWith(fontSize: 23).bold;
    }

    return Scaffold(
      backgroundColor: LightColor.extraLightBlue,
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: <Widget>[
            Hero(
              tag: 'doctor-${model.id}',
              child: Image.asset(model.image),
            ),
            DraggableScrollableSheet(
              maxChildSize: .8,
              initialChildSize: .6,
              minChildSize: .6,
              builder: (context, scrollController) {
                return Container(
                  height: AppTheme.fullHeight(context) * .5,
                  padding: EdgeInsets.only(
                    left: 19,
                    right: 19,
                    top: 16,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                    color: Colors.white,
                  ),
                  child: SingleChildScrollView(
                    physics: BouncingScrollPhysics(),
                    controller: scrollController,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        ListTile(
                          title: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: <Widget>[
                              Text(
                                model.name,
                                style: titleStyle,
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Icon(
                                Icons.check_circle,
                                size: 18,
                                color: Theme.of(context).primaryColor,
                              ),
                              Spacer(),
                              Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: RatingStarWidget(
                                  rating: model.rating,
                                ),
                              ),
                            ],
                          ),
                          subtitle: Text(
                            model.type,
                            style: TextStyles.bodySm.subTitleColor.bold,
                          ),
                        ),
                        Divider(
                          thickness: .3,
                          color: LightColor.grey,
                        ),
                        if (model.distance != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: Row(
                              children: [
                                Icon(Icons.location_on,
                                    color: LightColor.purple),
                                SizedBox(width: 8),
                                Text(
                                  "${model.distance!.toStringAsFixed(2)} km away",
                                  style: TextStyles.body.subTitleColor,
                                ),
                                if (model.address != null) ...[
                                  SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      "• ${model.address}",
                                      style: TextStyles.body.subTitleColor,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        Row(
                          children: <Widget>[
                            ProgressWidget(
                              value: model.goodReviews,
                              totalValue: 100,
                              activeColor: LightColor.purpleExtraLight,
                              backgroundColor: LightColor.grey.withOpacity(.3),
                              title: "Good Review",
                              durationTime: 500,
                            ),
                            ProgressWidget(
                              value: model.totalScore,
                              totalValue: 100,
                              activeColor: LightColor.purpleLight,
                              backgroundColor: LightColor.grey.withOpacity(.3),
                              title: "Total Score",
                              durationTime: 300,
                            ),
                            ProgressWidget(
                              value: model.satisfaction,
                              totalValue: 100,
                              activeColor: LightColor.purple,
                              backgroundColor: LightColor.grey.withOpacity(.3),
                              title: "Satisfaction",
                              durationTime: 800,
                            ),
                          ],
                        ),
                        Divider(
                          thickness: .3,
                          color: LightColor.grey,
                        ),
                        Text("About", style: titleStyle).vP16,
                        Text(
                          model.description,
                          style: TextStyles.body.subTitleColor,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: <Widget>[
                            Container(
                              height: 45,
                              width: 45,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                color: LightColor.grey.withAlpha(150),
                              ),
                              child: Icon(
                                Icons.call,
                                color: Colors.white,
                              ),
                            ).ripple(
                              () {
                                _makePhoneCall();
                              },
                              borderRadius: BorderRadius.circular(10),
                            ),
                            SizedBox(
                              width: 10,
                            ),
                            Container(
                              height: 45,
                              width: 45,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                color: LightColor.grey.withAlpha(150),
                              ),
                              child: Icon(
                                Icons.location_on,
                                color: Colors.white,
                              ),
                            ).ripple(
                              () {
                                _openMaps();
                              },
                              borderRadius: BorderRadius.circular(10),
                            ),
                            SizedBox(
                              width: 10,
                            ),
                            Container(
                              height: 45,
                              decoration: BoxDecoration(
                                  color: Theme.of(context).primaryColor,
                                  borderRadius: BorderRadius.circular(10)),
                              child: TextButton(
                                onPressed: _handleAppointmentBooking,
                                child: Text(
                                  "Make an appointment",
                                  style: TextStyles.titleNormal.white,
                                ),
                              ),
                            ),
                          ],
                        ).vP16
                      ],
                    ),
                  ),
                );
              },
            ),
            _appbar(),
          ],
        ),
      ),
    );
  }
}

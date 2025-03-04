import 'dart:math';
import 'package:flutter/material.dart';
import 'package:doctor_appointment/model/doctor_model.dart';
import 'package:doctor_appointment/theme/light_color.dart';
import 'package:doctor_appointment/theme/text_styles.dart';
import 'package:doctor_appointment/theme/extention.dart';
import 'package:doctor_appointment/theme/theme.dart';
import 'package:doctor_appointment/services/api_service.dart';
import 'package:doctor_appointment/services/location_service.dart';
import 'package:doctor_appointment/widgets/profile_avatar.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';

class HomePageScreen extends StatefulWidget {
  HomePageScreen({
    Key? key,
  }) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePageScreen>
    with SingleTickerProviderStateMixin {
  List<DoctorModel> doctorDataList = [];
  bool isLoading = true;
  bool hasError = false;
  String errorMessage = '';
  String? selectedSpecialty;
  Position? currentPosition;
  TextEditingController searchController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 1000),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeIn,
      ),
    );
    _animationController.forward();
    _initializeApp();
  }

  @override
  void dispose() {
    _animationController.dispose();
    searchController.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    // Print platform info
    String platform = Platform.isAndroid
        ? 'Android'
        : Platform.isIOS
            ? 'iOS'
            : 'Unknown';
    print('Home screen initialized on $platform platform');
    print('Using API base URL: ${ApiService.getEffectiveBaseUrl()}');

    await _getCurrentLocation();
    await _loadDoctors();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await LocationService.getCurrentLocation();

      if (position != null) {
        setState(() {
          currentPosition = position;
        });
        // Reload doctors with location
        _loadDoctors();
      }
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  Future<void> _loadDoctors() async {
    setState(() {
      isLoading = true;
      hasError = false;
      errorMessage = '';
    });

    try {
      final doctors = await ApiService.getDoctors(
        specialty: selectedSpecialty,
        latitude: currentPosition?.latitude,
        longitude: currentPosition?.longitude,
      );

      setState(() {
        doctorDataList = doctors;
        isLoading = false;
      });

      print('Loaded ${doctors.length} doctors');
    } catch (e) {
      print('Error loading doctors: $e');
      setState(() {
        isLoading = false;
        hasError = true;
        errorMessage = e.toString();
      });

      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load doctors: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 5),
          action: SnackBarAction(
            label: 'Retry',
            onPressed: _loadDoctors,
            textColor: Colors.white,
          ),
        ),
      );
    }
  }

  Widget _appBar() {
    return AppBar(
      elevation: 0,
      backgroundColor: Theme.of(context).colorScheme.background,
      leading: Icon(
        Icons.short_text,
        size: 30,
        color: Colors.black,
      ),
      actions: <Widget>[
        IconButton(
          icon: Icon(
            Icons.notifications_none,
            size: 30,
            color: LightColor.grey,
          ),
          onPressed: () {},
        ),
        IconButton(
          icon: Icon(
            Icons.calendar_today,
            color: LightColor.grey,
          ),
          onPressed: () {
            Navigator.pushNamed(context, '/MyAppointments');
          },
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: ProfileAvatar(),
        ),
      ],
    );
  }

  Widget _header() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          "Hello,",
          style: TextStyles.title.subTitleColor,
        ),
        Text("Find Your Doctor", style: TextStyles.h1Style),
      ],
    ).p16;
  }

  Widget _searchField() {
    return Container(
      height: 55,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      width: MediaQuery.of(context).size.width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(Radius.circular(13)),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: LightColor.grey.withOpacity(.3),
            blurRadius: 15,
            offset: Offset(5, 5),
          )
        ],
      ),
      child: TextField(
        controller: searchController,
        decoration: InputDecoration(
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: InputBorder.none,
          hintText: "Search",
          hintStyle: TextStyles.body.subTitleColor,
          suffixIcon: SizedBox(
            width: 50,
            child:
                Icon(Icons.search, color: LightColor.purple).alignCenter.ripple(
              () {
                _loadDoctors();
              },
              borderRadius: BorderRadius.circular(13),
            ),
          ),
        ),
        onSubmitted: (value) {
          _loadDoctors();
        },
      ),
    );
  }

  Widget _specialtySelector() {
    return Container(
      height: 40,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _specialtyChip("All", null),
          _specialtyChip("Heart Surgeon", "Heart Surgeon"),
          _specialtyChip("Neurology", "Neurology"),
          _specialtyChip("Cardio Surgeon", "Cardio Surgeon"),
          _specialtyChip("Dermatology", "Dermatology"),
          _specialtyChip("Pediatrics", "Pediatrics"),
        ],
      ),
    );
  }

  Widget _specialtyChip(String label, String? value) {
    final isSelected = selectedSpecialty == value;

    return Container(
      margin: EdgeInsets.only(right: 10),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (bool selected) {
          setState(() {
            selectedSpecialty = selected ? value : null;
          });

          _loadDoctors();
        },
        backgroundColor: Colors.white,
        selectedColor: LightColor.purple.withOpacity(0.2),
        labelStyle: TextStyle(
          color: isSelected ? LightColor.purple : LightColor.grey,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _category() {
    return Column(
      children: <Widget>[
        Padding(
          padding: EdgeInsets.only(top: 8, right: 16, left: 16, bottom: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text("Category", style: TextStyles.title.bold),
              Text(
                "See All",
                style: TextStyles.titleNormal
                    .copyWith(color: Theme.of(context).primaryColor),
              ).p(8).ripple(() {})
            ],
          ),
        ),
        SizedBox(
          height: AppTheme.fullHeight(context) * .28,
          width: AppTheme.fullWidth(context),
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: <Widget>[
              _categoryCardWidget(
                "Chemist & Drugist",
                "350 + Stores",
                color: LightColor.green,
                lightColor: LightColor.lightGreen,
              ),
              _categoryCardWidget(
                "Covid - 19 Specialist",
                "899 Doctors",
                color: LightColor.skyBlue,
                lightColor: LightColor.lightBlue,
              ),
              _categoryCardWidget(
                "Cardiologists Specialist",
                "500 + Doctors",
                color: LightColor.orange,
                lightColor: LightColor.lightOrange,
              )
            ],
          ),
        ),
      ],
    );
  }

  Widget _categoryCardWidget(
    String title,
    String subtitle, {
    Color? color,
    Color? lightColor,
  }) {
    TextStyle titleStyle = TextStyles.title.bold.white;
    TextStyle subtitleStyle = TextStyles.body.bold.white;
    if (AppTheme.fullWidth(context) < 392) {
      titleStyle = TextStyles.body.bold.white;
      subtitleStyle = TextStyles.bodySm.bold.white;
    }
    return AspectRatio(
      aspectRatio: 6 / 8,
      child: Container(
        height: 280,
        width: AppTheme.fullWidth(context) * .3,
        margin: EdgeInsets.only(left: 10, right: 10, bottom: 20, top: 10),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.all(Radius.circular(20)),
          boxShadow: <BoxShadow>[
            BoxShadow(
              offset: Offset(4, 4),
              blurRadius: 10,
              color: lightColor!.withOpacity(.8),
            )
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.all(Radius.circular(20)),
          child: Container(
            child: Stack(
              children: <Widget>[
                Positioned(
                  top: -20,
                  left: -20,
                  child: CircleAvatar(
                    backgroundColor: lightColor,
                    radius: 60,
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: <Widget>[
                    Flexible(
                      child: Text(title, style: titleStyle).hP8,
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    Flexible(
                      child: Text(
                        subtitle,
                        style: subtitleStyle,
                      ).hP8,
                    ),
                  ],
                ).p16
              ],
            ),
          ),
        ).ripple(() {
          setState(() {
            selectedSpecialty =
                title == "Cardiologists Specialist" ? "Cardio Surgeon" : null;
          });
          _loadDoctors();
        }, borderRadius: BorderRadius.all(Radius.circular(20))),
      ),
    );
  }

  Widget _doctorsList() {
    return SliverList(
      delegate: SliverChildListDelegate(
        [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text("Top Doctors", style: TextStyles.title.bold),
              IconButton(
                  icon: Icon(
                    Icons.sort,
                    color: Theme.of(context).primaryColor,
                  ),
                  onPressed: () {})
            ],
          ).hP16,
          isLoading
              ? Center(
                  child: Column(
                    children: [
                      SizedBox(height: 20),
                      CircularProgressIndicator(
                        valueColor:
                            AlwaysStoppedAnimation<Color>(LightColor.purple),
                      ),
                      SizedBox(height: 10),
                      Text(
                        "Loading doctors...",
                        style: TextStyles.body.subTitleColor,
                      ),
                    ],
                  ),
                )
              : hasError
                  ? Center(
                      child: Column(
                        children: [
                          Text(
                            "Error loading doctors",
                            style: TextStyles.body.subTitleColor,
                          ),
                          SizedBox(height: 10),
                          Text(
                            errorMessage,
                            style: TextStyle(color: Colors.red, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 10),
                          ElevatedButton(
                            onPressed: _loadDoctors,
                            child: Text("Retry"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: LightColor.purple,
                            ),
                          ),
                        ],
                      ),
                    ).vP16
                  : doctorDataList.isEmpty
                      ? Center(
                          child: Text(
                            "No doctors found",
                            style: TextStyles.body.subTitleColor,
                          ),
                        ).vP16
                      : getdoctorWidgetList()
        ],
      ),
    );
  }

  Widget getdoctorWidgetList() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Column(
        children: doctorDataList.map((x) {
          return _doctorTile(x);
        }).toList(),
      ),
    );
  }

  Widget _doctorTile(DoctorModel model) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(Radius.circular(20)),
        boxShadow: <BoxShadow>[
          BoxShadow(
            offset: Offset(4, 4),
            blurRadius: 10,
            color: LightColor.grey.withOpacity(.2),
          ),
          BoxShadow(
            offset: Offset(-3, 0),
            blurRadius: 15,
            color: LightColor.grey.withOpacity(.1),
          )
        ],
      ),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        child: ListTile(
          contentPadding: EdgeInsets.all(0),
          leading: Hero(
            tag: 'doctor-${model.id}',
            child: ClipRRect(
              borderRadius: BorderRadius.all(Radius.circular(13)),
              child: Container(
                height: 55,
                width: 55,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  color: randomColor(),
                ),
                child: Image.asset(
                  model.image,
                  height: 50,
                  width: 50,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),
          title: Text(model.name, style: TextStyles.title.bold),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                model.type,
                style: TextStyles.bodySm.subTitleColor.bold,
              ),
              if (model.distance != null)
                Text(
                  "${model.distance!.toStringAsFixed(2)} km away",
                  style: TextStyles.bodySm.subTitleColor,
                ),
            ],
          ),
          trailing: Icon(
            Icons.keyboard_arrow_right,
            size: 30,
            color: Theme.of(context).primaryColor,
          ),
        ),
      ).ripple(
        () {
          Navigator.pushNamed(context, "/DetailPage", arguments: model);
        },
        borderRadius: BorderRadius.all(Radius.circular(20)),
      ),
    );
  }

  Color randomColor() {
    var random = Random();
    final colorList = [
      Theme.of(context).primaryColor,
      LightColor.orange,
      LightColor.green,
      LightColor.grey,
      LightColor.lightOrange,
      LightColor.skyBlue,
      LightColor.titleTextColor,
      Colors.red,
      Colors.brown,
      LightColor.purpleExtraLight,
      LightColor.skyBlue,
    ];
    var color = colorList[random.nextInt(colorList.length)];
    return color;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _appBar() as PreferredSizeWidget,
      backgroundColor: Theme.of(context).colorScheme.background,
      body: CustomScrollView(
        slivers: <Widget>[
          SliverList(
            delegate: SliverChildListDelegate(
              [
                _header(),
                _searchField(),
                _specialtySelector(),
                _category(),
              ],
            ),
          ),
          _doctorsList()
        ],
      ),
    );
  }
}

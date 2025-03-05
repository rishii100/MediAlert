import 'dart:convert';

class DoctorModel {
  String? id;
  String name;
  String type;
  String description;
  double rating;
  double goodReviews;
  double totalScore;
  double satisfaction;
  bool isfavourite;
  String image;
  double? latitude;
  double? longitude;
  String? address;
  double? distance;

  DoctorModel({
    this.id,
    required this.name,
    required this.type,
    required this.description,
    required this.rating,
    required this.goodReviews,
    required this.totalScore,
    required this.satisfaction,
    required this.isfavourite,
    required this.image,
    this.latitude,
    this.longitude,
    this.address,
    this.distance,
  });

  DoctorModel copyWith({
    String? id,
    String? name,
    String? type,
    String? description,
    double? rating,
    double? goodReviews,
    double? totalScore,
    double? satisfaction,
    bool? isfavourite,
    String? image,
    double? latitude,
    double? longitude,
    String? address,
    double? distance,
  }) =>
      DoctorModel(
        id: id ?? this.id,
        name: name ?? this.name,
        type: type ?? this.type,
        description: description ?? this.description,
        rating: rating ?? this.rating,
        goodReviews: goodReviews ?? this.goodReviews,
        totalScore: totalScore ?? this.totalScore,
        satisfaction: satisfaction ?? this.satisfaction,
        isfavourite: isfavourite ?? this.isfavourite,
        image: image ?? this.image,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        address: address ?? this.address,
        distance: distance ?? this.distance,
      );

  factory DoctorModel.fromRawJson(String str) =>
      DoctorModel.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory DoctorModel.fromJson(Map<String, dynamic> json) => DoctorModel(
        id: json["_id"] ?? json["id"],
        name: json["name"] ?? "",
        type: json["specialty"] ?? "",
        description: json["description"] ?? "",
        rating: json["rating"]?.toDouble() ?? 0.0,
        goodReviews: json["goodReviews"]?.toDouble() ?? 0.0,
        totalScore: json["totalScore"]?.toDouble() ?? 0.0,
        satisfaction: json["satisfaction"]?.toDouble() ?? 0.0,
        isfavourite: json["isfavourite"] ?? false,
        image: json["image"] ?? "assets/doctor.png",
        latitude: json["latitude"]?.toDouble(),
        longitude: json["longitude"]?.toDouble(),
        address: json["address"],
        distance: json["distance"]?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "specialty": type,
        "description": description,
        "rating": rating,
        "goodReviews": goodReviews,
        "totalScore": totalScore,
        "satisfaction": satisfaction,
        "isfavourite": isfavourite,
        "image": image,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "distance": distance,
      };
}

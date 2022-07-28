// To parse this JSON data, do
//
//     final singupRequest = singupRequestFromJson(jsonString);

import 'dart:convert';

SingupRequest singupRequestFromJson(String str) => SingupRequest.fromJson(json.decode(str));

String singupRequestToJson(SingupRequest data) => json.encode(data.toJson());

class SingupRequest {
    SingupRequest({
        this.firstName,
        this.lastName,
        this.email,
        this.dateOfBirth,
        this.phoneNr,
        this.idRepLanguage,
        this.currentDateTime,
    });

    String firstName;
    String lastName;
    String email;
    String dateOfBirth;
    String phoneNr;
    int idRepLanguage;
    String currentDateTime;

    factory SingupRequest.fromJson(Map<String, dynamic> json) => SingupRequest(
        firstName: json["firstName"],
        lastName: json["lastName"],
        email: json["email"],
        dateOfBirth: json["dateOfBirth"],
        phoneNr: json["phoneNr"],
        idRepLanguage: json["idRepLanguage"],
        currentDateTime: json["currentDateTime"],
    );

    Map<String, dynamic> toJson() => {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "dateOfBirth": dateOfBirth,
        "phoneNr": phoneNr,
        "idRepLanguage": idRepLanguage,
        "currentDateTime": currentDateTime,
    };
}

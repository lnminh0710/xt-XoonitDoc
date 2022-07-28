// To parse this JSON data, do
//
//     final signupRequest = signupRequestFromJson(jsonString);

import 'dart:convert';

SignupRequest signupRequestFromJson(String str) =>
    SignupRequest.fromJson(json.decode(str));

String signupRequestToJson(SignupRequest data) => json.encode(data.toJson());

class SignupRequest {
  String firstName;
  String lastName;
  String email;
  String loginName;
  String password;
  String dateOfBirth;
  String phoneNr;
  int idRepLanguage;

  SignupRequest({
    this.firstName,
    this.lastName,
    this.email,
    this.loginName,
    this.password,
    this.dateOfBirth,
    this.phoneNr,
    this.idRepLanguage,
  });



  factory SignupRequest.fromJson(Map<String, dynamic> json) => SignupRequest(
        firstName: json["firstName"],
        lastName: json["lastName"],
        email: json["email"],
        loginName: json["loginName"],
        password: json["password"],
        dateOfBirth: json["dateOfBirth"],
        phoneNr: json["phoneNr"],
        idRepLanguage: json["idRepLanguage"],
      );

  Map<String, dynamic> toJson() => {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "loginName": loginName,
        "password": password,
        "dateOfBirth": dateOfBirth,
        "phoneNr": phoneNr,
        "idRepLanguage": idRepLanguage,
      };
}

// To parse this JSON data, do
//
//     final changePasswordRequest = changePasswordRequestFromJson(jsonString);

import 'dart:convert';

ChangePasswordRequest changePasswordRequestFromJson(String str) => ChangePasswordRequest.fromJson(json.decode(str));

String changePasswordRequestToJson(ChangePasswordRequest data) => json.encode(data.toJson());

class ChangePasswordRequest {
    ChangePasswordRequest({
        this.password,
        this.newPassword,
        this.currentDateTime,
    });

    String password;
    String newPassword;
    String currentDateTime;

    factory ChangePasswordRequest.fromJson(Map<String, dynamic> json) => ChangePasswordRequest(
        password: json["password"],
        newPassword: json["newPassword"],
        currentDateTime: json["currentDateTime"],
    );

    Map<String, dynamic> toJson() => {
        "password": password,
        "newPassword": newPassword,
        "currentDateTime": currentDateTime,
    };
}

// To parse this JSON data, do
//
//     final fogotPasswordRequest = fogotPasswordRequestFromJson(jsonString);

import 'dart:convert';

ForgotPasswordRequest fogotPasswordRequestFromJson(String str) => ForgotPasswordRequest.fromJson(json.decode(str));

String fogotPasswordRequestToJson(ForgotPasswordRequest data) => json.encode(data.toJson());

class ForgotPasswordRequest {
    ForgotPasswordRequest({
        this.currentDateTime,
        this.email,
    });

    String currentDateTime;
    String email;

    factory ForgotPasswordRequest.fromJson(Map<String, dynamic> json) => ForgotPasswordRequest(
        currentDateTime: json["CurrentDateTime"],
        email: json["Email"],
    );

    Map<String, dynamic> toJson() => {
        "CurrentDateTime": currentDateTime,
        "Email": email,
    };
}

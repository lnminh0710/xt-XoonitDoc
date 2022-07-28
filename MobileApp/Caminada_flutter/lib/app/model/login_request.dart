// To parse this JSON data, do
//
//     final loginRequest = loginRequestFromJson(jsonString);

import 'dart:convert';

LoginRequest loginRequestFromJson(String str) => LoginRequest.fromJson(json.decode(str));

String loginRequestToJson(LoginRequest data) => json.encode(data.toJson());

class LoginRequest {
    LoginRequest({
        this.email,
        this.password,
    });

    String email;
    String password;

    factory LoginRequest.fromJson(Map<String, dynamic> json) => LoginRequest(
        email: json["Email"],
        password: json["Password"],
    );

    Map<String, dynamic> toJson() => {
        "Email": email,
        "Password": password,
    };
}

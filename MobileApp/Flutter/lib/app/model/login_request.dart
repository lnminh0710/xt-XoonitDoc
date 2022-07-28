// To parse this JSON data, do
//
//     final loginRequest = loginRequestFromJson(jsonString);

import 'dart:convert';

LoginRequest loginRequestFromJson(String str) => LoginRequest.fromJson(json.decode(str));

String loginRequestToJson(LoginRequest data) => json.encode(data.toJson());

class LoginRequest {
    String loginName;
    String password;

    LoginRequest({
        this.loginName,
        this.password,
    });

    LoginRequest copyWith({
        String loginName,
        String password,
    }) => 
        LoginRequest(
            loginName: loginName ?? this.loginName,
            password: password ?? this.password,
        );

    factory LoginRequest.fromJson(Map<String, dynamic> json) => LoginRequest(
        loginName: json["LoginName"],
        password: json["Password"],
    );

    Map<String, dynamic> toJson() => {
        "LoginName": loginName,
        "Password": password,
    };
}

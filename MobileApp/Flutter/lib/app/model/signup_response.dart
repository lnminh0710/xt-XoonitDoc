// To parse this JSON data, do
//
//     final signupResponse = signupResponseFromJson(jsonString);

import 'dart:convert';

SignupResponse signupResponseFromJson(String str) => SignupResponse.fromJson(json.decode(str));

String signupResponseToJson(SignupResponse data) => json.encode(data.toJson());

class SignupResponse {
    int statusCode;
    dynamic resultDescription;
    Item item;

    SignupResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory SignupResponse.fromJson(Map<String, dynamic> json) => SignupResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: Item.fromJson(json["item"]),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": item.toJson(),
    };
}

class Item {
    String accessToken;
    String refreshToken;
    String tokenType;
    String expiresIn;
    String result;
    dynamic message;
    dynamic messageType;

    Item({
        this.accessToken,
        this.refreshToken,
        this.tokenType,
        this.expiresIn,
        this.result,
        this.message,
        this.messageType,
    });

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        accessToken: json["access_token"],
        refreshToken: json["refresh_token"],
        tokenType: json["token_type"],
        expiresIn: json["expires_in"],
        result: json["result"],
        message: json["message"],
        messageType: json["message_type"],
    );

    Map<String, dynamic> toJson() => {
        "access_token": accessToken,
        "refresh_token": refreshToken,
        "token_type": tokenType,
        "expires_in": expiresIn,
        "result": result,
        "message": message,
        "message_type": messageType,
    };
}

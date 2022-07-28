// To parse this JSON data, do
//
//     final loginResponse = loginResponseFromJson(jsonString);

import 'dart:convert';

LoginResponse loginResponseFromJson(String str) => LoginResponse.fromJson(json.decode(str));

String loginResponseToJson(LoginResponse data) => json.encode(data.toJson());

class LoginResponse {
    int statusCode;
    dynamic resultDescription;
    Item item;

    LoginResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    LoginResponse copyWith({
        int statusCode,
        dynamic resultDescription,
        Item item,
    }) => 
        LoginResponse(
            statusCode: statusCode ?? this.statusCode,
            resultDescription: resultDescription ?? this.resultDescription,
            item: item ?? this.item,
        );

    factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
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

    Item copyWith({
        String accessToken,
        String refreshToken,
        String tokenType,
        String expiresIn,
        String result,
        dynamic message,
        dynamic messageType,
    }) => 
        Item(
            accessToken: accessToken ?? this.accessToken,
            refreshToken: refreshToken ?? this.refreshToken,
            tokenType: tokenType ?? this.tokenType,
            expiresIn: expiresIn ?? this.expiresIn,
            result: result ?? this.result,
            message: message ?? this.message,
            messageType: messageType ?? this.messageType,
        );

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

// To parse this JSON data, do
//
//     final updateAvatarResponse = updateAvatarResponseFromJson(jsonString);

import 'dart:convert';

UpdateAvatarResponse updateAvatarResponseFromJson(String str) => UpdateAvatarResponse.fromJson(json.decode(str));

String updateAvatarResponseToJson(UpdateAvatarResponse data) => json.encode(data.toJson());

class UpdateAvatarResponse {
    UpdateAvatarResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    Item item;

    factory UpdateAvatarResponse.fromJson(Map<String, dynamic> json) => UpdateAvatarResponse(
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
    Item({
        this.avatarUrl,
        this.loginPicture,
        this.returnId,
        this.storedName,
        this.eventType,
        this.userErrorMessage,
        this.windownMessageType,
        this.forDeveloper,
    });

    String avatarUrl;
    String loginPicture;
    String returnId;
    String storedName;
    String eventType;
    String userErrorMessage;
    dynamic windownMessageType;
    String forDeveloper;

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        avatarUrl: json["avatarUrl"],
        loginPicture: json["loginPicture"],
        returnId: json["returnID"],
        storedName: json["storedName"],
        eventType: json["eventType"],
        userErrorMessage: json["userErrorMessage"],
        windownMessageType: json["windownMessageType"],
        forDeveloper: json["forDeveloper"],
    );

    Map<String, dynamic> toJson() => {
        "avatarUrl": avatarUrl,
        "loginPicture": loginPicture,
        "returnID": returnId,
        "storedName": storedName,
        "eventType": eventType,
        "userErrorMessage": userErrorMessage,
        "windownMessageType": windownMessageType,
        "forDeveloper": forDeveloper,
    };
}

// To parse this JSON data, do
//
//     final uploadImageResponse = uploadImageResponseFromJson(jsonString);

import 'dart:convert';

class UploadImageResponse {
    int statusCode;
    dynamic resultDescription;
    Item item;

    UploadImageResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory UploadImageResponse.fromRawJson(String str) => UploadImageResponse.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory UploadImageResponse.fromJson(Map<String, dynamic> json) => UploadImageResponse(
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
    int uploadSpeed;
    Result result;

    Item({
        this.uploadSpeed,
        this.result,
    });

    factory Item.fromRawJson(String str) => Item.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        uploadSpeed: json["uploadSpeed"],
        result: Result.fromJson(json["result"]),
    );

    Map<String, dynamic> toJson() => {
        "uploadSpeed": uploadSpeed,
        "result": result.toJson(),
    };
}

class Result {
    String returnId;
    String eventType;
    dynamic sqlStoredMessage;
    bool isSuccess;
    dynamic payload;

    Result({
        this.returnId,
        this.eventType,
        this.sqlStoredMessage,
        this.isSuccess,
        this.payload,
    });

    factory Result.fromRawJson(String str) => Result.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory Result.fromJson(Map<String, dynamic> json) => Result(
        returnId: json["returnID"],
        eventType: json["eventType"],
        sqlStoredMessage: json["sqlStoredMessage"],
        isSuccess: json["isSuccess"],
        payload: json["payload"],
    );

    Map<String, dynamic> toJson() => {
        "returnID": returnId,
        "eventType": eventType,
        "sqlStoredMessage": sqlStoredMessage,
        "isSuccess": isSuccess,
        "payload": payload,
    };
}

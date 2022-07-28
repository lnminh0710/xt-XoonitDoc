// To parse this JSON data, do
//
//     final saveDocumentResponse = saveDocumentResponseFromJson(jsonString);

import 'dart:convert';

SaveDocumentResponse saveDocumentResponseFromJson(String str) => SaveDocumentResponse.fromJson(json.decode(str));

String saveDocumentResponseToJson(SaveDocumentResponse data) => json.encode(data.toJson());

class SaveDocumentResponse {
    SaveDocumentResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    Item item;

    factory SaveDocumentResponse.fromJson(Map<String, dynamic> json) => SaveDocumentResponse(
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
        this.returnId,
        this.eventType,
        this.sqlStoredMessage,
        this.userErrorMessage,
        this.isSuccess,
        this.payload,
    });

    String returnId;
    String eventType;
    dynamic sqlStoredMessage;
    String userErrorMessage;
    bool isSuccess;
    dynamic payload;

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        returnId: json["returnID"],
        eventType: json["eventType"],
        sqlStoredMessage: json["sqlStoredMessage"],
        userErrorMessage: json["userErrorMessage"],
        isSuccess: json["isSuccess"],
        payload: json["payload"],
    );

    Map<String, dynamic> toJson() => {
        "returnID": returnId,
        "eventType": eventType,
        "sqlStoredMessage": sqlStoredMessage,
        "userErrorMessage": userErrorMessage,
        "isSuccess": isSuccess,
        "payload": payload,
    };
}

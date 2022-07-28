// To parse this JSON data, do
//
//     final saveContactResponse = saveContactResponseFromJson(jsonString);

import 'dart:convert';

SaveContactResponse saveContactResponseFromJson(String str) =>
    SaveContactResponse.fromJson(json.decode(str));

String saveContactResponseToJson(SaveContactResponse data) =>
    json.encode(data.toJson());

class SaveContactResponse {
  int statusCode;
  dynamic resultDescription;
  Item item;

  SaveContactResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  factory SaveContactResponse.fromJson(Map<String, dynamic> json) =>
      SaveContactResponse(
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
  dynamic object;
  bool isSuccess;
  int count;

  Item({
    this.object,
    this.isSuccess,
    this.count,
  });

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        object: json["object"],
        isSuccess: json["isSuccess"],
        count: json["count"],
      );

  Map<String, dynamic> toJson() => {
        "object": object,
        "isSuccess": isSuccess,
        "count": count,
      };
}

// To parse this JSON data, do
//
//     final singupResponse = singupResponseFromJson(jsonString);

import 'dart:convert';

SingupResponse singupResponseFromJson(String str) => SingupResponse.fromJson(json.decode(str));

String singupResponseToJson(SingupResponse data) => json.encode(data.toJson());

class SingupResponse {
    SingupResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    String resultDescription;
    SingupResponse item;

    factory SingupResponse.fromJson(Map<String, dynamic> json) => SingupResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"] == null ? null : json["resultDescription"],
        item: json["item"] == null ? null : SingupResponse.fromJson(json["item"]),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription == null ? null : resultDescription,
        "item": item == null ? null : item.toJson(),
    };
}

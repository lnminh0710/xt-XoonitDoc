// To parse this JSON data, do
//
//     final createFolderResponse = createFolderResponseFromJson(jsonString);

import 'dart:convert';

CreateFolderResponse createFolderResponseFromJson(String str) => CreateFolderResponse.fromJson(json.decode(str));

String createFolderResponseToJson(CreateFolderResponse data) => json.encode(data.toJson());

class CreateFolderResponse {
    CreateFolderResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    int item;

    factory CreateFolderResponse.fromJson(Map<String, dynamic> json) => CreateFolderResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: json["item"],
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": item,
    };
}

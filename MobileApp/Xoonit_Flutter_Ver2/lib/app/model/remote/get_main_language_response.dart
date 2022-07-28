// To parse this JSON data, do
//
//     final getMainLanguageResponse = getMainLanguageResponseFromJson(jsonString);

import 'dart:convert';

GetMainLanguageResponse getMainLanguageResponseFromJson(String str) => GetMainLanguageResponse.fromJson(json.decode(str));

String getMainLanguageResponseToJson(GetMainLanguageResponse data) => json.encode(data.toJson());

class GetMainLanguageResponse {
    GetMainLanguageResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    Item item;

    factory GetMainLanguageResponse.fromJson(Map<String, dynamic> json) => GetMainLanguageResponse(
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
        this.data,
    });

    List<List<MainLanguage>> data;

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        data: List<List<MainLanguage>>.from(json["data"].map((x) => List<MainLanguage>.from(x.map((x) => MainLanguage.fromJson(x))))),
    );

    Map<String, dynamic> toJson() => {
        "data": List<dynamic>.from(data.map((x) => List<dynamic>.from(x.map((x) => x.toJson())))),
    };
}

class MainLanguage {
    MainLanguage({
        this.settingColumnName,
        this.idRepLanguage,
        this.languageCode,
        this.defaultValue,
    });

    String settingColumnName;
    int idRepLanguage;
    String languageCode;
    String defaultValue;

    factory MainLanguage.fromJson(Map<String, dynamic> json) => MainLanguage(
        settingColumnName: json["SettingColumnName"] == null ? null : json["SettingColumnName"],
        idRepLanguage: json["IdRepLanguage"] == null ? null : json["IdRepLanguage"],
        languageCode: json["LanguageCode"] == null ? null : json["LanguageCode"],
        defaultValue: json["DefaultValue"] == null ? null : json["DefaultValue"],
    );

    Map<String, dynamic> toJson() => {
        "SettingColumnName": settingColumnName == null ? null : settingColumnName,
        "IdRepLanguage": idRepLanguage == null ? null : idRepLanguage,
        "LanguageCode": languageCode == null ? null : languageCode,
        "DefaultValue": defaultValue == null ? null : defaultValue,
    };
}

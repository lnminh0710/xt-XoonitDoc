// To parse this JSON data, do
//
//     final mainLanguageRespone = mainLanguageResponeFromJson(jsonString);

import 'dart:convert';

MainLanguageRespone mainLanguageResponeFromJson(String str) => MainLanguageRespone.fromJson(json.decode(str));

String mainLanguageResponeToJson(MainLanguageRespone data) => json.encode(data.toJson());

class MainLanguageRespone {
    int statusCode;
    dynamic resultDescription;
    List<Language> language;

    MainLanguageRespone({
        this.statusCode,
        this.resultDescription,
        this.language,
    });

    factory MainLanguageRespone.fromJson(Map<String, dynamic> json) => MainLanguageRespone(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        language: List<Language>.from(json["item"].map((x) => Language.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(language.map((x) => x.toJson())),
    };
}

class Language {
    String idRepLanguage;
    String languageCode;
    String defaultValue;

    Language({
        this.idRepLanguage,
        this.languageCode,
        this.defaultValue,
    });

    factory Language.fromJson(Map<String, dynamic> json) => Language(
        idRepLanguage: json["idRepLanguage"],
        languageCode: json["languageCode"],
        defaultValue: json["defaultValue"],
    );

    Map<String, dynamic> toJson() => {
        "idRepLanguage": idRepLanguage,
        "languageCode": languageCode,
        "defaultValue": defaultValue,
    };
}

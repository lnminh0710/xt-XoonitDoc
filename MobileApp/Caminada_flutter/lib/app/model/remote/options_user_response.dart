import 'dart:convert';

OptionUsersResponse optionUsersResponseFromJson(String str) => OptionUsersResponse.fromJson(json.decode(str));

String optionUsersResponseToJson(OptionUsersResponse data) => json.encode(data.toJson());

class OptionUsersResponse {
    OptionUsersResponse({
        this.statusCode,
        this.resultDescription,
        this.optionData,
    });

    int statusCode;
    dynamic resultDescription;
    OptionData optionData;

    factory OptionUsersResponse.fromJson(Map<String, dynamic> json) => OptionUsersResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        optionData: OptionData.fromJson(json["item"]),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": optionData.toJson(),
    };
}

class OptionData {
    OptionData({
        this.fullNameList,
        this.emailList,
        this.companyList,
    });

    List<EmailAndNameUser> fullNameList;
    List<EmailAndNameUser> emailList;
    dynamic companyList;

    factory OptionData.fromJson(Map<String, dynamic> json) => OptionData(
        fullNameList: List<EmailAndNameUser>.from(json["fullNameList"].map((x) => EmailAndNameUser.fromJson(x))),
        emailList: List<EmailAndNameUser>.from(json["emailList"].map((x) => EmailAndNameUser.fromJson(x))),
        companyList: json["companyList"],
    );

    Map<String, dynamic> toJson() => {
        "fullNameList": List<dynamic>.from(fullNameList.map((x) => x.toJson())),
        "emailList": List<dynamic>.from(emailList.map((x) => x.toJson())),
        "companyList": companyList,
    };
}

class EmailAndNameUser {
    EmailAndNameUser({
        this.idValue,
        this.textValue,
    });

    String idValue;
    String textValue;

    factory EmailAndNameUser.fromJson(Map<String, dynamic> json) => EmailAndNameUser(
        idValue: json["idValue"],
        textValue: json["textValue"],
    );

    Map<String, dynamic> toJson() => {
        "idValue": idValue,
        "textValue": textValue,
    };
}


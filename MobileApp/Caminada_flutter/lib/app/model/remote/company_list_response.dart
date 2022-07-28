import 'dart:convert';

CompanyListResponse companyListResponseFromJson(String str) =>
    CompanyListResponse.fromJson(json.decode(str));

String companyListResponseToJson(CompanyListResponse data) =>
    json.encode(data.toJson());

class CompanyListResponse {
  CompanyListResponse({
    this.statusCode,
    this.resultDescription,
    this.companyList,
  }) {
    if (this.companyList == null) {
      this.companyList = List<CompanyItem>();
    }
  }

  int statusCode;
  dynamic resultDescription;
  List<CompanyItem> companyList;

  factory CompanyListResponse.fromJson(Map<String, dynamic> json) =>
      CompanyListResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        companyList: List<CompanyItem>.from(
            json["item"].map((x) => CompanyItem.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(companyList.map((x) => x.toJson())),
      };
}

class CompanyItem {
  CompanyItem({
    this.idValue,
    this.textValue,
  });

  String idValue;
  String textValue;

  factory CompanyItem.fromJson(Map<String, dynamic> json) => CompanyItem(
        idValue: json["idValue"],
        textValue: json["textValue"],
      );

  Map<String, dynamic> toJson() => {
        "idValue": idValue,
        "textValue": textValue,
      };
}

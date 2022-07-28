// To parse this JSON data, do
//
//     final contactDetailsResponse = contactDetailsResponseFromJson(jsonString);

import 'dart:convert';

ContactDetailsResponse contactDetailsResponseFromJson(String str) =>
    ContactDetailsResponse.fromJson(json.decode(str));

String contactDetailsResponseToJson(ContactDetailsResponse data) =>
    json.encode(data.toJson());

class ContactDetailsResponse {
  int statusCode;
  dynamic resultDescription;
  List<ContactDetails> contactDetailsValue;

  ContactDetailsResponse({
    this.statusCode,
    this.resultDescription,
    this.contactDetailsValue,
  });

  factory ContactDetailsResponse.fromJson(Map<String, dynamic> json) =>
      ContactDetailsResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        contactDetailsValue: List<ContactDetails>.from(
            json["item"].map((x) => ContactDetails.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(contactDetailsValue.map((x) => x.toJson())),
      };
}

class ContactDetails {
  String columnName;
  String value;
  DataType dataType;
  String dataLength;
  String originalColumnName;
  Setting setting;

  ContactDetails({
    this.columnName,
    this.value,
    this.dataType,
    this.dataLength,
    this.originalColumnName,
    this.setting,
  });

  factory ContactDetails.fromJson(Map<String, dynamic> json) => ContactDetails(
        columnName: json["columnName"],
        value: json["value"],
        dataType: dataTypeValues.map[json["dataType"]],
        dataLength: json["dataLength"],
        originalColumnName: json["originalColumnName"],
        setting: Setting.fromJson(json["setting"]),
      );

  Map<String, dynamic> toJson() => {
        "columnName": columnName,
        "value": value,
        "dataType": dataTypeValues.reverse[dataType],
        "dataLength": dataLength,
        "originalColumnName": originalColumnName,
        "setting": setting.toJson(),
      };
}

enum DataType { BIGINT, NVARCHAR, INT }

final dataTypeValues = EnumValues({
  "bigint": DataType.BIGINT,
  "int": DataType.INT,
  "nvarchar": DataType.NVARCHAR
});

class Setting {
  DisplayField displayField;
  dynamic controlType;
  dynamic validators;

  Setting({
    this.displayField,
    this.controlType,
    this.validators,
  });

  factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        displayField: DisplayField.fromJson(json["displayField"]),
        controlType: json["controlType"],
        validators: json["validators"],
      );

  Map<String, dynamic> toJson() => {
        "displayField": displayField.toJson(),
        "controlType": controlType,
        "validators": validators,
      };
}

class DisplayField {
  String hidden;
  String readOnly;
  String orderBy;

  DisplayField({
    this.hidden,
    this.readOnly,
    this.orderBy,
  });

  factory DisplayField.fromJson(Map<String, dynamic> json) => DisplayField(
        hidden: json["hidden"],
        readOnly: json["readOnly"],
        orderBy: json["orderBy"],
      );

  Map<String, dynamic> toJson() => {
        "hidden": hidden,
        "readOnly": readOnly,
        "orderBy": orderBy,
      };
}

class EnumValues<T> {
  Map<String, T> map;
  Map<T, String> reverseMap;

  EnumValues(this.map);

  Map<T, String> get reverse {
    if (reverseMap == null) {
      reverseMap = map.map((k, v) => new MapEntry(v, k));
    }
    return reverseMap;
  }
}

// To parse this JSON data, do
//
//     final contactDetailResponse = contactDetailResponseFromJson(jsonString);

import 'dart:convert';

ContactDetailResponse contactDetailResponseFromJson(String str) => ContactDetailResponse.fromJson(json.decode(str));

String contactDetailResponseToJson(ContactDetailResponse data) => json.encode(data.toJson());

class ContactDetailResponse {
    ContactDetailResponse({
        this.statusCode,
        this.resultDescription,
        this.contactDetailItems,
    });

    int statusCode;
    dynamic resultDescription;
    List<ContactDetailItem> contactDetailItems;

    factory ContactDetailResponse.fromJson(Map<String, dynamic> json) => ContactDetailResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        contactDetailItems: List<ContactDetailItem>.from(json["item"].map((x) => ContactDetailItem.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(contactDetailItems.map((x) => x.toJson())),
    };
}

class ContactDetailItem {
    ContactDetailItem({
        this.columnName,
        this.value,
        this.dataType,
        this.dataLength,
        this.originalColumnName,
        this.setting,
    });

    String columnName;
    String value;
    String dataType;
    int dataLength;
    String originalColumnName;
    ContactDetailColumnSetting setting;

    factory ContactDetailItem.fromJson(Map<String, dynamic> json) => ContactDetailItem(
        columnName: json["columnName"],
        value: json["value"],
        dataType: json["dataType"],
        dataLength: json["dataLength"] == null ? null : json["dataLength"],
        originalColumnName: json["originalColumnName"],
        setting: ContactDetailColumnSetting.fromJson(json["setting"]),
    );

    Map<String, dynamic> toJson() => {
        "columnName": columnName,
        "value": value,
        "dataType": dataType,
        "dataLength": dataLength == null ? null : dataLength,
        "originalColumnName": originalColumnName,
        "setting": setting.toJson(),
    };
}

class ContactDetailColumnSetting {
    ContactDetailColumnSetting({
        this.displayField,
        this.controlType,
        this.validators,
        this.customStyle,
    });

    DisplayField displayField;
    ControlType controlType;
    Validators validators;
    String customStyle;

    factory ContactDetailColumnSetting.fromJson(Map<String, dynamic> json) => ContactDetailColumnSetting(
        displayField: DisplayField.fromJson(json["DisplayField"]),
        controlType: json["ControlType"] == null ? null : ControlType.fromJson(json["ControlType"]),
        validators: json["Validators"] == null ? null : Validators.fromJson(json["Validators"]),
        customStyle: json["CustomStyle"] == null ? null : json["CustomStyle"],
    );

    Map<String, dynamic> toJson() => {
        "DisplayField": displayField.toJson(),
        "ControlType": controlType == null ? null : controlType.toJson(),
        "Validators": validators == null ? null : validators.toJson(),
        "CustomStyle": customStyle == null ? null : customStyle,
    };
}

class ControlType {
    ControlType({
        this.type,
        this.value,
    });

    String type;
    dynamic value;

    factory ControlType.fromJson(Map<String, dynamic> json) => ControlType(
        type: json["Type"],
        value: json["Value"],
    );

    Map<String, dynamic> toJson() => {
        "Type": type,
        "Value": value,
    };
}

class DisplayField {
    DisplayField({
        this.hidden,
        this.readOnly,
        this.orderBy,
        this.groupHeader,
    });

    String hidden;
    String readOnly;
    String orderBy;
    String groupHeader;

    factory DisplayField.fromJson(Map<String, dynamic> json) => DisplayField(
        hidden: json["Hidden"],
        readOnly: json["ReadOnly"],
        orderBy: json["OrderBy"],
        groupHeader: json["GroupHeader"],
    );

    Map<String, dynamic> toJson() => {
        "Hidden": hidden,
        "ReadOnly": readOnly,
        "OrderBy": orderBy,
        "GroupHeader": groupHeader,
    };
}

class Validators {
    Validators({
        this.ignoreKeyCharacters,
        this.maxLength,
        this.pattern,
    });

    dynamic ignoreKeyCharacters;
    String maxLength;
    dynamic pattern;

    factory Validators.fromJson(Map<String, dynamic> json) => Validators(
        ignoreKeyCharacters: json["IgnoreKeyCharacters"],
        maxLength: json["MaxLength"],
        pattern: json["Pattern"],
    );

    Map<String, dynamic> toJson() => {
        "IgnoreKeyCharacters": ignoreKeyCharacters,
        "MaxLength": maxLength,
        "Pattern": pattern,
    };
}

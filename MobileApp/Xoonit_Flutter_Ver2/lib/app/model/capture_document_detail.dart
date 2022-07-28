class CaptureDocumentDetailResponse {
  CaptureDocumentDetailResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  final int statusCode;
  final dynamic resultDescription;
  final List<CaptureDocumentDetail> item;

  factory CaptureDocumentDetailResponse.fromJson(Map<String, dynamic> json) =>
      CaptureDocumentDetailResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: List<CaptureDocumentDetail>.from(
            json["item"].map((x) => CaptureDocumentDetail.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(item.map((x) => x.toJson())),
      };
}

class CaptureDocumentDetail {
  CaptureDocumentDetail({
    this.columnName,
    this.value,
    this.dataType,
    this.dataLength,
    this.originalColumnName,
    this.setting,
  });

  final String columnName;
  final String value;
  final String dataType;
  final int dataLength;
  final String originalColumnName;
  final Setting setting;

  factory CaptureDocumentDetail.fromJson(Map<String, dynamic> json) =>
      CaptureDocumentDetail(
        columnName: json["columnName"],
        value: json["value"],
        dataType: json["dataType"],
        dataLength: json["dataLength"] == null ? null : json["dataLength"],
        originalColumnName: json["originalColumnName"],
        setting: Setting.fromJson(json["setting"]),
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

class Setting {
  Setting({
    this.displayField,
    this.controlType,
    this.validators,
    this.customStyle,
  });

  final DisplayField displayField;
  final ControlType controlType;
  final Validators validators;
  final String customStyle;

  factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        displayField: DisplayField.fromJson(json["DisplayField"]),
        controlType: json["ControlType"] == null
            ? null
            : ControlType.fromJson(json["ControlType"]),
        validators: json["Validators"] == null
            ? null
            : Validators.fromJson(json["Validators"]),
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

  final String type;
  final String value;

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

  final String hidden;
  final String readOnly;
  final String orderBy;
  final String groupHeader;

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

  final String ignoreKeyCharacters;
  final String maxLength;
  final Pattern pattern;

  factory Validators.fromJson(Map<String, dynamic> json) => Validators(
        ignoreKeyCharacters: json["IgnoreKeyCharacters"] == null
            ? null
            : json["IgnoreKeyCharacters"],
        maxLength: json["MaxLength"] == null ? null : json["MaxLength"],
        pattern:
            json["Pattern"] == null ? null : Pattern.fromJson(json["Pattern"]),
      );

  Map<String, dynamic> toJson() => {
        "IgnoreKeyCharacters":
            ignoreKeyCharacters == null ? null : ignoreKeyCharacters,
        "MaxLength": maxLength == null ? null : maxLength,
        "Pattern": pattern == null ? null : pattern.toJson(),
      };
}

class Pattern {
  Pattern({
    this.message,
    this.regex,
  });

  final String message;
  final String regex;

  factory Pattern.fromJson(Map<String, dynamic> json) => Pattern(
        message: json["Message"],
        regex: json["Regex"],
      );

  Map<String, dynamic> toJson() => {
        "Message": message,
        "Regex": regex,
      };
}

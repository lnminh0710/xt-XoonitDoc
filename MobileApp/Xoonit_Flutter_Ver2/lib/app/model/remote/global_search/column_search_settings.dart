// To parse this JSON data, do
//
//     final columnSearchSettings = columnSearchSettingsFromJson(jsonString);

import 'dart:convert';

List<ColumnSearchSettings> columnSearchSettingsFromJson(String str) =>
    List<ColumnSearchSettings>.from(
        json.decode(str).map((x) => ColumnSearchSettings.fromJson(x)));

String columnSearchSettingsToJson(List<ColumnSearchSettings> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class ColumnSearchSettings {
  ColumnSearchSettings({
    this.widgetTitle,
    this.columnsName,
  });

  String widgetTitle;
  List<ColumnsName> columnsName;

  factory ColumnSearchSettings.fromJson(Map<String, dynamic> json) =>
      ColumnSearchSettings(
        widgetTitle: json["WidgetTitle"] == null ? null : json["WidgetTitle"],
        columnsName: json["ColumnsName"] == null
            ? null
            : List<ColumnsName>.from(
                json["ColumnsName"].map((x) => ColumnsName.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "WidgetTitle": widgetTitle == null ? null : widgetTitle,
        "ColumnsName": columnsName == null
            ? null
            : List<dynamic>.from(columnsName.map((x) => x.toJson())),
      };
}

class ColumnsName {
  ColumnsName({
    this.columnName,
    this.columnHeader,
    this.value,
    this.dataType,
    this.dataLength,
    this.originalColumnName,
    this.setting,
  });

  String columnName;
  String columnHeader;
  String value;
  String dataType;
  String dataLength;
  String originalColumnName;
  List<ColumnSetting> setting;

  factory ColumnsName.fromJson(Map<String, dynamic> json) => ColumnsName(
        columnName: json["ColumnName"],
        columnHeader: json["ColumnHeader"],
        value: json["Value"],
        dataType: json["DataType"],
        dataLength: json["DataLength"],
        originalColumnName: json["OriginalColumnName"],
        setting: List<ColumnSetting>.from(
            json["Setting"].map((x) => ColumnSetting.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "ColumnName": columnName,
        "ColumnHeader": columnHeader,
        "Value": value,
        "DataType": dataType,
        "DataLength": dataLength,
        "OriginalColumnName": originalColumnName,
        "Setting": List<dynamic>.from(setting.map((x) => x.toJson())),
      };
}


class ColumnSetting {
    ColumnSetting({
        this.displayField,
        this.controlType,
    });

    DisplayField displayField;
    ControlType controlType;

    factory ColumnSetting.fromJson(Map<String, dynamic> json) => ColumnSetting(
        displayField: json["DisplayField"] == null ? null : DisplayField.fromJson(json["DisplayField"]),
        controlType: json["ControlType"] == null ? null : ControlType.fromJson(json["ControlType"]),
    );

    Map<String, dynamic> toJson() => {
        "DisplayField": displayField == null ? null : displayField.toJson(),
        "ControlType": controlType == null ? null : controlType.toJson(),
    };
}
class ControlType {
    ControlType({
        this.type,
    });

    String type;

    factory ControlType.fromJson(Map<String, dynamic> json) => ControlType(
        type: json["Type"],
    );

    Map<String, dynamic> toJson() => {
        "Type": type,
    };
}


class DisplayField {
  DisplayField({this.hidden, this.readOnly});

  String hidden;
  String readOnly;

  factory DisplayField.fromJson(Map<String, dynamic> json) => DisplayField(
        hidden: json["Hidden"],
        readOnly: json["ReadOnly"],
      );

  Map<String, dynamic> toJson() => {
        "Hidden": hidden,
        "ReadOnly": readOnly,
      };
}

// To parse this JSON data, do
//
//     final historyResponse = historyResponseFromJson(jsonString);

import 'dart:convert';

HistoryResponse historyResponseFromJson(String str) => HistoryResponse.fromJson(json.decode(str));

String historyResponseToJson(HistoryResponse data) => json.encode(data.toJson());

class HistoryResponse {
    int statusCode;
    dynamic resultDescription;
    Item item;

    HistoryResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory HistoryResponse.fromJson(Map<String, dynamic> json) => HistoryResponse(
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
    List<HistoryItem> data;
    List<ColumnsHistory> columns;
    int totalResults;

    Item({
        this.data,
        this.columns,
        this.totalResults,
    });

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        data: List<HistoryItem>.from(json["data"].map((x) => HistoryItem.fromJson(x))),
        columns: List<ColumnsHistory>.from(json["columns"].map((x) => ColumnsHistory.fromJson(x))),
        totalResults: json["totalResults"],
    );

    Map<String, dynamic> toJson() => {
        "data": List<dynamic>.from(data.map((x) => x.toJson())),
        "columns": List<dynamic>.from(columns.map((x) => x.toJson())),
        "totalResults": totalResults,
    };
}

class ColumnsHistory {
    String title;
    String data;
    Setting setting;

    ColumnsHistory({
        this.title,
        this.data,
        this.setting,
    });

    factory ColumnsHistory.fromJson(Map<String, dynamic> json) => ColumnsHistory(
        title: json["title"],
        data: json["data"],
        setting: Setting.fromJson(json["setting"]),
    );

    Map<String, dynamic> toJson() => {
        "title": title,
        "data": data,
        "setting": setting.toJson(),
    };
}

class Setting {
    String columnName;
    String columnHeader;
    List<SettingElement> setting;
    String value;
    String dataType;
    String dataLength;
    String originalColumnName;

    Setting({
        this.columnName,
        this.columnHeader,
        this.setting,
        this.value,
        this.dataType,
        this.dataLength,
        this.originalColumnName,
    });

    factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        columnName: json["ColumnName"],
        columnHeader: json["ColumnHeader"],
        setting: List<SettingElement>.from(json["Setting"].map((x) => SettingElement.fromJson(x))),
        value: json["Value"],
        dataType: json["DataType"],
        dataLength: json["DataLength"],
        originalColumnName: json["OriginalColumnName"],
    );

    Map<String, dynamic> toJson() => {
        "ColumnName": columnName,
        "ColumnHeader": columnHeader,
        "Setting": List<dynamic>.from(setting.map((x) => x.toJson())),
        "Value": value,
        "DataType": dataType,
        "DataLength": dataLength,
        "OriginalColumnName": originalColumnName,
    };
}

class SettingElement {
    DisplayField displayField;

    SettingElement({
        this.displayField,
    });

    factory SettingElement.fromJson(Map<String, dynamic> json) => SettingElement(
        displayField: DisplayField.fromJson(json["DisplayField"]),
    );

    Map<String, dynamic> toJson() => {
        "DisplayField": displayField.toJson(),
    };
}

class DisplayField {
    String hidden;

    DisplayField({
        this.hidden,
    });

    factory DisplayField.fromJson(Map<String, dynamic> json) => DisplayField(
        hidden: json["Hidden"],
    );

    Map<String, dynamic> toJson() => {
        "Hidden": hidden,
    };
}

class HistoryItem {
    String idDocumentContainerScans;
    String fileName;
    String docType;
    String totalDocument;
    String scanDate;
    String scanTime;
    String devices;
    String syncStatus;
    String cloud;

    HistoryItem({
        this.idDocumentContainerScans,
        this.fileName,
        this.docType,
        this.totalDocument,
        this.scanDate,
        this.scanTime,
        this.devices,
        this.syncStatus,
        this.cloud,
    });

    factory HistoryItem.fromJson(Map<String, dynamic> json) => HistoryItem(
        idDocumentContainerScans: json["IdDocumentContainerScans"],
        fileName: json["FileName"],
        docType: json["DocType"],
        totalDocument: json["TotalDocument"],
        scanDate: json["ScanDate"],
        scanTime: json["ScanTime"],
        devices: json["Devices"],
        syncStatus: json["SyncStatus"],
        cloud: json["Cloud"],
    );

    Map<String, dynamic> toJson() => {
        "IdDocumentContainerScans": idDocumentContainerScans,
        "FileName": fileName,
        "DocType": docType,
        "TotalDocument": totalDocument,
        "ScanDate": scanDate,
        "ScanTime": scanTime,
        "Devices": devices,
        "SyncStatus": syncStatus,
        "Cloud": cloud,
    };
}

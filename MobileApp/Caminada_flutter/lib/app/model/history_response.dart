// To parse this JSON data, do
//
//     final historyResponse = historyResponseFromJson(jsonString);

import 'dart:convert';

HistoryResponse historyResponseFromJson(String str) => HistoryResponse.fromJson(json.decode(str));

String historyResponseToJson(HistoryResponse data) => json.encode(data.toJson());

class HistoryResponse {
    HistoryResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    Item item;

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
    Item({
        this.totalSummary,
        this.data,
        this.columns,
        this.totalResults,
    });

    TotalSummary totalSummary;
    List<HistoryData> data;
    List<ColumnHistory> columns;
    int totalResults;

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        totalSummary: TotalSummary.fromJson(json["totalSummary"]),
        data: List<HistoryData>.from(json["data"].map((x) => HistoryData.fromJson(x))),
        columns: List<ColumnHistory>.from(json["columns"].map((x) => ColumnHistory.fromJson(x))),
        totalResults: json["totalResults"],
    );

    Map<String, dynamic> toJson() => {
        "totalSummary": totalSummary.toJson(),
        "data": List<dynamic>.from(data.map((x) => x.toJson())),
        "columns": List<dynamic>.from(columns.map((x) => x.toJson())),
        "totalResults": totalResults,
    };
}

class ColumnHistory {
    ColumnHistory({
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
    DataType dataType;
    int dataLength;
    String originalColumnName;
    Setting setting;

    factory ColumnHistory.fromJson(Map<String, dynamic> json) => ColumnHistory(
        columnName: json["columnName"],
        columnHeader: json["columnHeader"],
        value: json["value"],
        dataType: dataTypeValues.map[json["dataType"]],
        dataLength: json["dataLength"],
        originalColumnName: json["originalColumnName"],
        setting: Setting.fromJson(json["setting"]),
    );

    Map<String, dynamic> toJson() => {
        "columnName": columnName,
        "columnHeader": columnHeader,
        "value": value,
        "dataType": dataTypeValues.reverse[dataType],
        "dataLength": dataLength,
        "originalColumnName": originalColumnName,
        "setting": setting.toJson(),
    };
}

enum DataType { NVARCHAR, EMPTY }

final dataTypeValues = EnumValues({
    "": DataType.EMPTY,
    "nvarchar": DataType.NVARCHAR
});

class Setting {
    Setting({
        this.displayField,
        this.controlType,
    });

    dynamic displayField;
    dynamic controlType;

    factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        displayField: json["DisplayField"],
        controlType: json["ControlType"],
    );

    Map<String, dynamic> toJson() => {
        "DisplayField": displayField,
        "ControlType": controlType,
    };
}

class HistoryData {
    HistoryData({
        this.company,
        this.fullName,
        this.initials,
        this.email,
        this.scanDate,
        this.scan,
        this.datumImport,
        this.mobile,
        this.transferring,
        this.transferred,
    });

    String company;
    String fullName;
    String initials;
    String email;
    String scanDate;
    int scan;
    int datumImport;
    int mobile;
    int transferring;
    int transferred;

    factory HistoryData.fromJson(Map<String, dynamic> json) => HistoryData(
        company: json["Company"],
        fullName: json["FullName"],
        initials: json["Initials"],
        email: json["Email"],
        scanDate: json["ScanDate"],
        scan: json["Scan"],
        datumImport: json["Import"],
        mobile: json["Mobile"],
        transferring: json["Transferring"],
        transferred: json["Transferred"],
    );

    Map<String, dynamic> toJson() => {
        "Company": company,
        "FullName": fullName,
        "Initials": initials,
        "Email": email,
        "ScanDate": scanDate,
        "Scan": scan,
        "Import": datumImport,
        "Mobile": mobile,
        "Transferring": transferring,
        "Transferred": transferred,
    };
}

class TotalSummary {
    TotalSummary({
        this.scan,
        this.totalSummaryImport,
        this.mobile,
        this.transferring,
        this.transferred,
    });

    int scan;
    int totalSummaryImport;
    int mobile;
    int transferring;
    int transferred;

    factory TotalSummary.fromJson(Map<String, dynamic> json) => TotalSummary(
        scan: json["scan"],
        totalSummaryImport: json["import"],
        mobile: json["mobile"],
        transferring: json["transferring"],
        transferred: json["transferred"],
    );

    Map<String, dynamic> toJson() => {
        "scan": scan,
        "import": totalSummaryImport,
        "mobile": mobile,
        "transferring": transferring,
        "transferred": transferred,
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

// To parse this JSON data, do
//
//     final allSearchModuleResponse = allSearchModuleResponseFromJson(jsonString);

import 'dart:convert';

SearchCaptureDetailResponse allSearchModuleResponseFromJson(String str) => SearchCaptureDetailResponse.fromJson(json.decode(str));

String allSearchModuleResponseToJson(SearchCaptureDetailResponse data) => json.encode(data.toJson());

class SearchCaptureDetailResponse {
    SearchCaptureDetailResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    Item item;

    factory SearchCaptureDetailResponse.fromJson(Map<String, dynamic> json) => SearchCaptureDetailResponse(
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
        this.pageIndex,
        this.pageSize,
        this.total,
        this.results,
        this.setting,
        this.payload,
    });

    int pageIndex;
    int pageSize;
    int total;
    List<CaptureSearchResult> results;
    List<List<Setting>> setting;
    dynamic payload;

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<CaptureSearchResult>.from(json["results"].map((x) => CaptureSearchResult.fromJson(x))),
        setting: List<List<Setting>>.from(json["setting"].map((x) => List<Setting>.from(x.map((x) => Setting.fromJson(x))))),
        payload: json["payload"],
    );

    Map<String, dynamic> toJson() => {
        "pageIndex": pageIndex,
        "pageSize": pageSize,
        "total": total,
        "results": List<dynamic>.from(results.map((x) => x.toJson())),
        "setting": List<dynamic>.from(setting.map((x) => List<dynamic>.from(x.map((x) => x.toJson())))),
        "payload": payload,
    };
}

class CaptureSearchResult {
    CaptureSearchResult({
        this.idApplicationOwner,
        this.idDocumentContainerScans,
        this.isActive,
        this.isDeleted,
        this.createdDate,
        this.scannedPath,
        this.scannedFilename,
        this.numberOfImages,
        this.fullText,
        this.fullTextRemovedHtml,
        this.id,
    });

    int idApplicationOwner;
    int idDocumentContainerScans;
    bool isActive;
    bool isDeleted;
    String createdDate;
    String scannedPath;
    String scannedFilename;
    int numberOfImages;
    String fullText;
    String fullTextRemovedHtml;
    int id;

    factory CaptureSearchResult.fromJson(Map<String, dynamic> json) => CaptureSearchResult(
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        createdDate: json["createdDate"],
        scannedPath: json["scannedPath"],
        scannedFilename: json["scannedFilename"],
        numberOfImages: json["numberOfImages"],
        fullText: json["fullText"],
        fullTextRemovedHtml: json["fullText_RemovedHtml"],
        id: json["id"],
    );

    Map<String, dynamic> toJson() => {
        "idApplicationOwner": idApplicationOwner,
        "idDocumentContainerScans": idDocumentContainerScans,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "createdDate": createdDate,
        "scannedPath": scannedPath,
        "scannedFilename": scannedFilename,
        "numberOfImages": numberOfImages,
        "fullText": fullText,
        "fullText_RemovedHtml": fullTextRemovedHtml,
        "id": id,
    };
}

class Setting {
    Setting({
        this.settingColumnName,
    });

    String settingColumnName;

    factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        settingColumnName: json["SettingColumnName"],
    );

    Map<String, dynamic> toJson() => {
        "SettingColumnName": settingColumnName,
    };
}

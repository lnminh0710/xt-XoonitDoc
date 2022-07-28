// To parse this JSON data, do
//
//     final searchDocumentResponse = searchDocumentResponseFromJson(jsonString);

import 'dart:convert';

class SearchDocumentResponse {
    int statusCode;
    dynamic resultDescription;
    SearchDocumentItem item;

    SearchDocumentResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory SearchDocumentResponse.fromRawJson(String str) => SearchDocumentResponse.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory SearchDocumentResponse.fromJson(Map<String, dynamic> json) => SearchDocumentResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: SearchDocumentItem.fromJson(json["item"]),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": item.toJson(),
    };
}

class SearchDocumentItem {
    int pageIndex;
    int pageSize;
    int total;
    List<SearchDocumentResult> results;
    List<List<Setting>> setting;
    dynamic payload;

    SearchDocumentItem({
        this.pageIndex,
        this.pageSize,
        this.total,
        this.results,
        this.setting,
        this.payload,
    });

    factory SearchDocumentItem.fromRawJson(String str) => SearchDocumentItem.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory SearchDocumentItem.fromJson(Map<String, dynamic> json) => SearchDocumentItem(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<SearchDocumentResult>.from(json["results"].map((x) => SearchDocumentResult.fromJson(x))),
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

class SearchDocumentResult {
    int id;
    String createDate;
    String idApplicationOwner;
    String idDocumentContainerScans;
    String idMainDocument;
    String idDocumentTree;
    String idCloudConnection;
    String idRepDocumentGuiType;
    String rootName;
    String localPath;
    String localFileName;
    String cloudMediaPath;
    String groupName;
    String mediaName;
    String isSync;
    String isActive;
    String isDeleted;
    String fullText;

    SearchDocumentResult({
        this.id,
        this.createDate,
        this.idApplicationOwner,
        this.idDocumentContainerScans,
        this.idMainDocument,
        this.idDocumentTree,
        this.idCloudConnection,
        this.idRepDocumentGuiType,
        this.rootName,
        this.localPath,
        this.localFileName,
        this.cloudMediaPath,
        this.groupName,
        this.mediaName,
        this.isSync,
        this.isActive,
        this.isDeleted,
        this.fullText,
    });

    factory SearchDocumentResult.fromRawJson(String str) => SearchDocumentResult.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory SearchDocumentResult.fromJson(Map<String, dynamic> json) => SearchDocumentResult(
        id: json["id"],
        createDate: json["createDate"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idMainDocument: json["idMainDocument"],
        idDocumentTree: json["idDocumentTree"],
        idCloudConnection: json["idCloudConnection"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        rootName: json["rootName"],
        localPath: json["localPath"],
        localFileName: json["localFileName"],
        cloudMediaPath: json["cloudMediaPath"],
        groupName: json["groupName"],
        mediaName: json["mediaName"],
        isSync: json["isSync"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        fullText: json["fullText"],
    );

    Map<String, dynamic> toJson() => {
        "id": id,
        "createDate": createDate,
        "idApplicationOwner": idApplicationOwner,
        "idDocumentContainerScans": idDocumentContainerScans,
        "idMainDocument": idMainDocument,
        "idDocumentTree": idDocumentTree,
        "idCloudConnection": idCloudConnection,
        "idRepDocumentGuiType": idRepDocumentGuiType,
        "rootName": rootName,
        "localPath": localPath,
        "localFileName": localFileName,
        "cloudMediaPath": cloudMediaPath,
        "groupName": groupName,
        "mediaName": mediaName,
        "isSync": isSync,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "fullText": fullText,
    };
}

class Setting {
    String settingColumnName;

    Setting({
        this.settingColumnName,
    });

    factory Setting.fromRawJson(String str) => Setting.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        settingColumnName: json["SettingColumnName"],
    );

    Map<String, dynamic> toJson() => {
        "SettingColumnName": settingColumnName,
    };
}

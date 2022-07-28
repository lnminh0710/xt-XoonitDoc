// To parse this JSON data, do
//
//     final searchAllDocumentResponse = searchAllDocumentResponseFromJson(jsonString);

import 'dart:convert';

SearchAllDocumentResponse searchAllDocumentResponseFromJson(String str) => SearchAllDocumentResponse.fromJson(json.decode(str));

String searchAllDocumentResponseToJson(SearchAllDocumentResponse data) => json.encode(data.toJson());

class SearchAllDocumentResponse {
    SearchAllDocumentResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    Item item;

    factory SearchAllDocumentResponse.fromJson(Map<String, dynamic> json) => SearchAllDocumentResponse(
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
    List<SearchAllDocumentResult> results;
    List<List<Setting>> setting;
    dynamic payload;

    factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<SearchAllDocumentResult>.from(json["results"].map((x) => SearchAllDocumentResult.fromJson(x))),
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

class SearchAllDocumentResult {
    SearchAllDocumentResult({
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
        this.cloudFilePath,
        this.isSync,
        this.isActive,
        this.isDeleted,
        this.fullText,
    });

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
    String cloudFilePath;
    String isSync;
    String isActive;
    String isDeleted;
    String fullText;

    factory SearchAllDocumentResult.fromJson(Map<String, dynamic> json) => SearchAllDocumentResult(
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
        cloudFilePath: json["cloudFilePath"],
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
        "cloudFilePath": cloudFilePath,
        "isSync": isSync,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "fullText": fullText,
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

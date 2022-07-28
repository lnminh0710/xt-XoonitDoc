// To parse this JSON data, do
//
//     final otherDocumentSearchDetailResponse = otherDocumentSearchDetailResponseFromJson(jsonString);

import 'dart:convert';

SearchOtherDocumentDetailResponse otherDocumentSearchDetailResponseFromJson(
        String str) =>
    SearchOtherDocumentDetailResponse.fromJson(json.decode(str));

String otherDocumentSearchDetailResponseToJson(
        SearchOtherDocumentDetailResponse data) =>
    json.encode(data.toJson());

class SearchOtherDocumentDetailResponse {
  SearchOtherDocumentDetailResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  int statusCode;
  dynamic resultDescription;
  Item item;

  factory SearchOtherDocumentDetailResponse.fromJson(
          Map<String, dynamic> json) =>
      SearchOtherDocumentDetailResponse(
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
  List<OtherDocumentResult> results;
  List<List<Setting>> setting;
  dynamic payload;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<OtherDocumentResult>.from(
            json["results"].map((x) => OtherDocumentResult.fromJson(x))),
        setting: List<List<Setting>>.from(json["setting"]
            .map((x) => List<Setting>.from(x.map((x) => Setting.fromJson(x))))),
        payload: json["payload"],
      );

  Map<String, dynamic> toJson() => {
        "pageIndex": pageIndex,
        "pageSize": pageSize,
        "total": total,
        "results": List<dynamic>.from(results.map((x) => x.toJson())),
        "setting": List<dynamic>.from(
            setting.map((x) => List<dynamic>.from(x.map((x) => x.toJson())))),
        "payload": payload,
      };
}

class OtherDocumentResult {
  OtherDocumentResult({
    this.id,
    this.createDate,
    this.idApplicationOwner,
    this.idDocumentContainerScans,
    this.idMainDocument,
    this.idDocumentTree,
    this.scannedPath,
    this.scannedFilename,
    this.idCloudConnection,
    this.idRepDocumentGuiType,
    this.rootName,
    this.groupName,
    this.mediaName,
    this.isSync,
    this.isActive,
    this.isDeleted,
  });

  int id;
  String createDate;
  String idApplicationOwner;
  String idDocumentContainerScans;
  String idMainDocument;
  String idDocumentTree;
  String scannedPath;
  String scannedFilename;
  String idCloudConnection;
  String idRepDocumentGuiType;
  String rootName;
  String groupName;
  String mediaName;
  String isSync;
  String isActive;
  String isDeleted;

  factory OtherDocumentResult.fromJson(Map<String, dynamic> json) => OtherDocumentResult(
        id: json["id"],
        createDate: json["createDate"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idMainDocument: json["idMainDocument"],
        idDocumentTree: json["idDocumentTree"],
        scannedPath: json["scannedPath"],
        scannedFilename: json["scannedFilename"],
        idCloudConnection: json["idCloudConnection"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        rootName: json["rootName"],
        groupName: json["groupName"],
        mediaName: json["mediaName"],
        isSync: json["isSync"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "createDate": createDate,
        "idApplicationOwner": idApplicationOwner,
        "idDocumentContainerScans": idDocumentContainerScans,
        "idMainDocument": idMainDocument,
        "idDocumentTree": idDocumentTree,
        "scannedPath": scannedPath,
        "scannedFilename": scannedFilename,
        "idCloudConnection": idCloudConnection,
        "idRepDocumentGuiType": idRepDocumentGuiType,
        "rootName": rootName,
        "groupName": groupName,
        "mediaName": mediaName,
        "isSync": isSync,
        "isActive": isActive,
        "isDeleted": isDeleted,
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

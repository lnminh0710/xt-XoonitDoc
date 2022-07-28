// To parse this JSON data, do
//
//     final searchInvoiceResponse = searchInvoiceResponseFromJson(jsonString);

import 'dart:convert';

SearchInvoiceResponse searchInvoiceResponseFromJson(String str) =>
    SearchInvoiceResponse.fromJson(json.decode(str));

String searchInvoiceResponseToJson(SearchInvoiceResponse data) =>
    json.encode(data.toJson());

class SearchInvoiceResponse {
  SearchInvoiceResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  int statusCode;
  dynamic resultDescription;
  Item item;

  factory SearchInvoiceResponse.fromJson(Map<String, dynamic> json) =>
      SearchInvoiceResponse(
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
  List<SearchInvoiceResult> results;
  List<List<Setting>> setting;
  dynamic payload;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<SearchInvoiceResult>.from(
            json["results"].map((x) => SearchInvoiceResult.fromJson(x))),
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

class SearchInvoiceResult {
  SearchInvoiceResult(
      {this.id,
      this.createDate,
      this.idApplicationOwner,
      this.idDocumentContainerScans,
      this.idMainDocument,
      this.idDocumentTree,
      this.idCloudConnection,
      this.idRepDocumentGuiType,
      this.rootName,
      this.groupName,
      this.mediaName,
      this.isSync,
      this.isActive,
      this.isDeleted,
      this.fullText,
      this.scannedFilename,
      this.scannedPath});

  int id;
  String createDate;
  String idApplicationOwner;
  String idDocumentContainerScans;
  String idMainDocument;
  String idDocumentTree;
  String idCloudConnection;
  String idRepDocumentGuiType;
  String rootName;
  String groupName;
  String mediaName;
  String isSync;
  String isActive;
  String isDeleted;
  String fullText;
  String scannedFilename;
  String scannedPath;

  factory SearchInvoiceResult.fromJson(Map<String, dynamic> json) =>
      SearchInvoiceResult(
        id: json["id"],
        createDate: json["createDate"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idMainDocument: json["idMainDocument"],
        idDocumentTree: json["idDocumentTree"],
        idCloudConnection: json["idCloudConnection"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        rootName: json["rootName"],
        groupName: json["groupName"],
        mediaName: json["mediaName"],
        isSync: json["isSync"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        fullText: json["fullText"],
        scannedPath: json["scannedPath"],
        scannedFilename: json["scannedFilename"],
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
        "groupName": groupName,
        "mediaName": mediaName,
        "isSync": isSync,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "fullText": fullText,
        "scannedPath": scannedPath,
        "scannedFilename": scannedFilename,
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

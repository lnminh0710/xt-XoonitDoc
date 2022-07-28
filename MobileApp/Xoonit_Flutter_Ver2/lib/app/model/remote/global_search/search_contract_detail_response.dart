// To parse this JSON data, do
//
//     final contractSearchDetailResponse = contractSearchDetailResponseFromJson(jsonString);

import 'dart:convert';

ContractSearchDetailResponse contractSearchDetailResponseFromJson(String str) =>
    ContractSearchDetailResponse.fromJson(json.decode(str));

String contractSearchDetailResponseToJson(ContractSearchDetailResponse data) =>
    json.encode(data.toJson());

class ContractSearchDetailResponse {
  ContractSearchDetailResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  int statusCode;
  dynamic resultDescription;
  Item item;

  factory ContractSearchDetailResponse.fromJson(Map<String, dynamic> json) =>
      ContractSearchDetailResponse(
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
  List<SearchContractResult> results;
  List<List<Setting>> setting;
  dynamic payload;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<SearchContractResult>.from(
            json["results"].map((x) => SearchContractResult.fromJson(x))),
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

class SearchContractResult {
  SearchContractResult({
    this.id,
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
    this.contacts,
    this.currencySymbol,
    this.currencyCode,
    this.contractNr,
    this.netAnnualPremium,
    this.commencementOfInsurance,
    this.termOfContract,
    this.isSync,
    this.isActive,
    this.scannedFilename,
    this.scannedPath,
    this.isDeleted,
    this.fullText,
    this.updateDate,
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
  String groupName;
  String mediaName;
  String contacts;
  String currencySymbol;
  String currencyCode;
  String contractNr;
  String netAnnualPremium;
  String commencementOfInsurance;
  String termOfContract;
  String isSync;
  String isActive;
  String isDeleted;
  String fullText;
  String updateDate;
  String scannedFilename;
  String scannedPath;

  factory SearchContractResult.fromJson(Map<String, dynamic> json) =>
      SearchContractResult(
        id: json["id"],
        createDate: json["createDate"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idMainDocument: json["idMainDocument"],
        idDocumentTree: json["idDocumentTree"],
        idCloudConnection: json["idCloudConnection"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        rootName: json["rootName"],
        scannedFilename: json["scannedFilename"],
        scannedPath: json["scannedPath"],
        groupName: json["groupName"],
        mediaName: json["mediaName"],
        contacts: json["contacts"] == null ? null : json["contacts"],
        currencySymbol:
            json["currencySymbol"] == null ? null : json["currencySymbol"],
        currencyCode:
            json["currencyCode"] == null ? null : json["currencyCode"],
        contractNr: json["contractNr"] == null ? null : json["contractNr"],
        netAnnualPremium:
            json["netAnnualPremium"] == null ? null : json["netAnnualPremium"],
        commencementOfInsurance: json["commencementOfInsurance"] == null
            ? null
            : json["commencementOfInsurance"],
        termOfContract:
            json["termOfContract"] == null ? null : json["termOfContract"],
        isSync: json["isSync"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"] == null ? null : json["isDeleted"],
        fullText: json["fullText"],
        updateDate: json["updateDate"] == null ? null : json["updateDate"],
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
        "contacts": contacts == null ? null : contacts,
        "currencySymbol": currencySymbol == null ? null : currencySymbol,
        "currencyCode": currencyCode == null ? null : currencyCode,
        "contractNr": contractNr == null ? null : contractNr,
        "netAnnualPremium": netAnnualPremium == null ? null : netAnnualPremium,
        "commencementOfInsurance":
            commencementOfInsurance == null ? null : commencementOfInsurance,
        "termOfContract": termOfContract == null ? null : termOfContract,
        "isSync": isSync,
        "isActive": isActive,
        "isDeleted": isDeleted == null ? null : isDeleted,
        "fullText": fullText,
        "updateDate": updateDate == null ? null : updateDate,
        "scannedPath": scannedPath,
        "scannedFilename": scannedFilename
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

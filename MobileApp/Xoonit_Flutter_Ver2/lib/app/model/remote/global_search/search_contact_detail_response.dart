// To parse this JSON data, do
//
//     final contactSearchDetailResponse = contactSearchDetailResponseFromJson(jsonString);

import 'dart:convert';

ContactSearchDetailResponse contactSearchDetailResponseFromJson(String str) =>
    ContactSearchDetailResponse.fromJson(json.decode(str));

String contactSearchDetailResponseToJson(ContactSearchDetailResponse data) =>
    json.encode(data.toJson());

class ContactSearchDetailResponse {
  ContactSearchDetailResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  int statusCode;
  dynamic resultDescription;
  Item item;

  factory ContactSearchDetailResponse.fromJson(Map<String, dynamic> json) =>
      ContactSearchDetailResponse(
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
    this.listContacts,
    this.setting,
    this.payload,
  });

  int pageIndex;
  int pageSize;
  int total;
  List<ContactSearchResult> listContacts;
  List<List<Setting>> setting;
  dynamic payload;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        listContacts: List<ContactSearchResult>.from(
            json["results"].map((x) => ContactSearchResult.fromJson(x))),
        setting: List<List<Setting>>.from(json["setting"]
            .map((x) => List<Setting>.from(x.map((x) => Setting.fromJson(x))))),
        payload: json["payload"],
      );

  Map<String, dynamic> toJson() => {
        "pageIndex": pageIndex,
        "pageSize": pageSize,
        "total": total,
        "results": List<dynamic>.from(listContacts.map((x) => x.toJson())),
        "setting": List<dynamic>.from(
            setting.map((x) => List<dynamic>.from(x.map((x) => x.toJson())))),
        "payload": payload,
      };
}

class ContactSearchResult {
  ContactSearchResult({
    this.idSearch,
    this.idApplicationOwner,
    this.idDocumentContainerScans,
    this.idMainDocument,
    this.idDocumentTree,
    this.idSharingCompany,
    this.idSharingName,
    this.idSharingAddress,
    this.idPersonInterface,
    this.rootName,
    this.localPath,
    this.localFileName,
    this.cloudMediaPath,
    this.groupName,
    this.mediaName,
    this.idPerson,
    this.personNr,
    this.personType,
    this.idPersonType,
    this.documentType,
    this.company,
    this.street,
    this.plz,
    this.place,
    this.pobox,
    this.communication,
    this.isActive,
    this.isDeleted,
    this.createDate,
    this.id,
    this.firstName,
    this.lastName,
    this.updateDate,
  });

  String idSearch;
  String idApplicationOwner;
  String idDocumentContainerScans;
  String idMainDocument;
  String idDocumentTree;
  String idSharingCompany;
  String idSharingName;
  String idSharingAddress;
  String idPersonInterface;
  String rootName;
  String localPath;
  String localFileName;
  String cloudMediaPath;
  String groupName;
  String mediaName;
  String idPerson;
  String personNr;
  String personType;
  String idPersonType;
  String documentType;
  String company;
  String street;
  String plz;
  String place;
  String pobox;
  String communication;
  String isActive;
  String isDeleted;
  String createDate;
  String id;
  String firstName;
  String lastName;
  String updateDate;

  factory ContactSearchResult.fromJson(Map<String, dynamic> json) =>
      ContactSearchResult(
        idSearch: json["idSearch"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idMainDocument: json["idMainDocument"],
        idDocumentTree: json["idDocumentTree"],
        idSharingCompany: json["idSharingCompany"],
        idSharingName: json["idSharingName"],
        idSharingAddress: json["idSharingAddress"],
        idPersonInterface: json["idPersonInterface"],
        rootName: json["rootName"],
        localPath: json["localPath"],
        localFileName: json["localFileName"],
        cloudMediaPath:
            json["cloudMediaPath"] == null ? null : json["cloudMediaPath"],
        groupName: json["groupName"],
        mediaName: json["mediaName"] == null ? null : json["mediaName"],
        idPerson: json["idPerson"],
        personNr: json["personNr"],
        personType: json["personType"],
        idPersonType: json["idPersonType"],
        documentType: json["documentType"],
        company: json["company"] == null ? null : json["company"],
        street: json["street"] == null ? null : json["street"],
        plz: json["plz"] == null ? null : json["plz"],
        place: json["place"] == null ? null : json["place"],
        pobox: json["pobox"] == null ? null : json["pobox"],
        communication:
            json["communication"] == null ? null : json["communication"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        createDate: json["createDate"],
        id: json["id"],
        firstName: json["firstName"] == null ? null : json["firstName"],
        lastName: json["lastName"] == null ? null : json["lastName"],
        updateDate: json["updateDate"] == null ? null : json["updateDate"],
      );

  Map<String, dynamic> toJson() => {
        "idSearch": idSearch,
        "idApplicationOwner": idApplicationOwner,
        "idDocumentContainerScans": idDocumentContainerScans,
        "idMainDocument": idMainDocument,
        "idDocumentTree": idDocumentTree,
        "idSharingCompany": idSharingCompany,
        "idSharingName": idSharingName,
        "idSharingAddress": idSharingAddress,
        "idPersonInterface": idPersonInterface,
        "rootName": rootName,
        "localPath": localPath,
        "localFileName": localFileName,
        "cloudMediaPath": cloudMediaPath == null ? null : cloudMediaPath,
        "groupName": groupName,
        "mediaName": mediaName == null ? null : mediaName,
        "idPerson": idPerson,
        "personNr": personNr,
        "personType": personType,
        "idPersonType": idPersonType,
        "documentType": documentType,
        "company": company == null ? null : company,
        "street": street == null ? null : street,
        "plz": plz == null ? null : plz,
        "place": place == null ? null : place,
        "pobox": pobox == null ? null : pobox,
        "communication": communication == null ? null : communication,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "createDate": createDate,
        "id": id,
        "firstName": firstName == null ? null : firstName,
        "lastName": lastName == null ? null : lastName,
        "updateDate": updateDate == null ? null : updateDate,
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

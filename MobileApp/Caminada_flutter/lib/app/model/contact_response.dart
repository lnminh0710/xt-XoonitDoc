import 'dart:convert';

class ContactResponse {
  int statusCode;
  dynamic resultDescription;
  Item item;

  ContactResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  factory ContactResponse.fromRawJson(String str) =>
      ContactResponse.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ContactResponse.fromJson(Map<String, dynamic> json) =>
      ContactResponse(
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
  int pageIndex;
  int pageSize;
  int total;
  List<Contact> listContacts;
  List<List<Setting>> setting;
  dynamic payload;

  Item({
    this.pageIndex,
    this.pageSize,
    this.total,
    this.listContacts,
    this.setting,
    this.payload,
  });

  factory Item.fromRawJson(String str) => Item.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
    listContacts:
    List<Contact>.from(json["results"].map((x) => Contact.fromJson(x))),
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

class Contact {
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
  String firstName;
  String lastName;
  String street;
  String plz;
  String communication;
  String isActive;
  String isDeleted;
  String createDate;
  String id;
  String place;
  String updateDate;
  String pobox;

  Contact({this.idSearch,
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
    this.firstName,
    this.lastName,
    this.street,
    this.plz,
    this.communication,
    this.isActive,
    this.isDeleted,
    this.createDate,
    this.id,
    this.place,
    this.updateDate,
    this.pobox});

  factory Contact.fromRawJson(String str) => Contact.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Contact.fromJson(Map<String, dynamic> json) =>
      Contact(
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
        cloudMediaPath: json["cloudMediaPath"],
        groupName: json["groupName"],
        mediaName: json["mediaName"],
        idPerson: json["idPerson"],
        personNr: json["personNr"],
        personType: json["personType"],
        idPersonType: json["idPersonType"],
        documentType: json["documentType"],
        company: json["company"] == null ? "" : json["company"],
        firstName: json["firstName"] == null ? "" : json["firstName"],
        lastName: json["lastName"] == null ? "" : json["lastName"],
        street: json["street"] == null ? "" : json["street"],
        plz: json["plz"] == null ? "" : json["plz"],
        communication: json["communication"] == null
            ? ""
            : json["communication"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        createDate: json["createDate"],
        id: json["id"],
        place: json["place"] == null ? "" : json["place"],
        updateDate: json["updateDate"] == null ? "" : json["updateDate"],
        pobox: json["pobox"] == null ? "" : json["pobox"],
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
        "cloudMediaPath": cloudMediaPath,
        "groupName": groupName,
        "mediaName": mediaName,
        "idPerson": idPerson,
        "personNr": personNr,
        "personType": personType,
        "idPersonType": idPersonType,
        "documentType": documentType,
        "company": company == null ? null : company,
        "firstName": firstName == null ? null : firstName,
        "lastName": lastName == null ? null : lastName,
        "street": street == null ? null : street,
        "plz": plz == null ? null : plz,
        "communication": communication,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "createDate": createDate,
        "id": id,
        "place": place == null ? null : place,
        "updateDate": updateDate == null ? null : updateDate,
    "pobox": pobox == null ? null : pobox,
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

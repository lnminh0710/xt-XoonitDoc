// To parse this JSON data, do
//
//     final attachmentContact = attachmentContactFromJson(jsonString);

import 'dart:convert';

AttachmentContact attachmentContactFromJson(String str) =>
    AttachmentContact.fromJson(json.decode(str));

String attachmentContactToJson(AttachmentContact data) =>
    json.encode(data.toJson());

class AttachmentContact {
  int statusCode;
  dynamic resultDescription;
  List<AttachmentContactItem> listAttachment;

  AttachmentContact({
    this.statusCode,
    this.resultDescription,
    this.listAttachment,
  });

  factory AttachmentContact.fromJson(Map<String, dynamic> json) =>
      AttachmentContact(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        listAttachment: List<AttachmentContactItem>.from(
            json["item"].map((x) => AttachmentContactItem.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(listAttachment.map((x) => x.toJson())),
      };
}

class AttachmentContactItem {
  String idPerson;
  String createDate;
  dynamic idApplicationOwner;
  String idDocumentContainerScans;
  String idMainDocument;
  String idDocumentTree;
  String idRepDocumentGuiType;
  dynamic rootName;
  dynamic localPath;
  String cloudMediaPath;
  String groupName;
  dynamic mediaName;
  dynamic contacts;
  dynamic isActive;
  dynamic isDeleted;
  dynamic fullText;
  String localFileName;

  AttachmentContactItem({
    this.idPerson,
    this.createDate,
    this.idApplicationOwner,
    this.idDocumentContainerScans,
    this.idMainDocument,
    this.idDocumentTree,
    this.idRepDocumentGuiType,
    this.rootName,
    this.localPath,
    this.cloudMediaPath,
    this.groupName,
    this.mediaName,
    this.contacts,
    this.isActive,
    this.isDeleted,
    this.fullText,
    this.localFileName,
  });

  factory AttachmentContactItem.fromJson(Map<String, dynamic> json) =>
      AttachmentContactItem(
        idPerson: json["idPerson"],
        createDate: json["createDate"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idMainDocument: json["idMainDocument"],
        idDocumentTree: json["idDocumentTree"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        rootName: json["rootName"],
        localPath: json["localPath"],
        cloudMediaPath: json["cloudMediaPath"],
        groupName: json["groupName"],
        mediaName: json["mediaName"],
        contacts: json["contacts"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        fullText: json["fullText"],
        localFileName: json["localFileName"],
      );

  Map<String, dynamic> toJson() => {
        "idPerson": idPerson,
        "createDate": createDate,
        "idApplicationOwner": idApplicationOwner,
        "idDocumentContainerScans": idDocumentContainerScans,
        "idMainDocument": idMainDocument,
        "idDocumentTree": idDocumentTree,
        "idRepDocumentGuiType": idRepDocumentGuiType,
        "rootName": rootName,
        "localPath": localPath,
        "cloudMediaPath": cloudMediaPath,
        "groupName": groupName,
        "mediaName": mediaName,
        "contacts": contacts,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "fullText": fullText,
        "localFileName": localFileName,
      };
}

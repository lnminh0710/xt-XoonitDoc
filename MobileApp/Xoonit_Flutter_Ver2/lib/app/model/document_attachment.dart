// To parse this JSON data, do
//
//     final documentAttachment = documentAttachmentFromJson(jsonString);

import 'dart:convert';

List<DocumentDetail> documentAttachmentFromJson(String str) =>
    List<DocumentDetail>.from(
        json.decode(str).map((x) => DocumentDetail.fromJson(x)));

String documentAttachmentToJson(List<DocumentDetail> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class DocumentDetail {
  String idDocumentContainerOcr;
  String pageNr;
  String idDocumentContainerScans;
  dynamic idDocumentTree;
  String fileName;
  String scannedPath;
  String idRepDocumentType;
  String documentType;
  String originalFileName;
  String rowNum;
  String isTodo;
  String toDoNotes;

  DocumentDetail(
      {this.idDocumentContainerOcr,
      this.pageNr,
      this.idDocumentContainerScans,
      this.idDocumentTree,
      this.fileName,
      this.scannedPath,
      this.idRepDocumentType,
      this.documentType,
      this.originalFileName,
      this.rowNum,
      this.isTodo,
      this.toDoNotes});

  factory DocumentDetail.fromJson(Map<String, dynamic> json) => DocumentDetail(
      idDocumentContainerOcr: json["IdDocumentContainerOcr"],
      pageNr: json["PageNr"],
      idDocumentContainerScans: json["IdDocumentContainerScans"],
      idDocumentTree: json["IdDocumentTree"],
      fileName: json["FileName"],
      scannedPath: json["ScannedPath"],
      idRepDocumentType: json["IdRepDocumentType"],
      documentType: json["DocumentType"],
      originalFileName: json["OriginalFileName"],
      rowNum: json["RowNum"],
      isTodo: json["IsToDo"] ?? "",
      toDoNotes: json["ToDoNotes"] ?? "");

  Map<String, dynamic> toJson() => {
        "IdDocumentContainerOcr": idDocumentContainerOcr,
        "PageNr": pageNr,
        "IdDocumentContainerScans": idDocumentContainerScans,
        "IdDocumentTree": idDocumentTree,
        "FileName": fileName,
        "ScannedPath": scannedPath,
        "IdRepDocumentType": idRepDocumentType,
        "DocumentType": documentType,
        "OriginalFileName": originalFileName,
        "RowNum": rowNum,
        "IsToDo": isTodo,
        "ToDoNotes": toDoNotes
      };
}

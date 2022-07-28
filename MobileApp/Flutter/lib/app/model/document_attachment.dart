// To parse this JSON data, do
//
//     final documentAttachment = documentAttachmentFromJson(jsonString);

import 'dart:convert';

List<DocumentAttachment> documentAttachmentFromJson(String str) =>
    List<DocumentAttachment>.from(
        json.decode(str).map((x) => DocumentAttachment.fromJson(x)));

String documentAttachmentToJson(List<DocumentAttachment> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class DocumentAttachment {
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

  DocumentAttachment({
    this.idDocumentContainerOcr,
    this.pageNr,
    this.idDocumentContainerScans,
    this.idDocumentTree,
    this.fileName,
    this.scannedPath,
    this.idRepDocumentType,
    this.documentType,
    this.originalFileName,
    this.rowNum,
  });

  factory DocumentAttachment.fromJson(Map<String, dynamic> json) =>
      DocumentAttachment(
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
      );

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
      };
}

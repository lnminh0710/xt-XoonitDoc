import 'dart:convert';

List<DeleteDocument> deleteDocumentFromJson(String str) =>
    List<DeleteDocument>.from(
        json.decode(str).map((x) => DeleteDocument.fromJson(x)));

String deleteDocumentToJson(List<DeleteDocument> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class DeleteDocument {
  int idDocumentContainerScans;
  bool statusDeleteOnDb;
  String resultDeleteFiles;

  DeleteDocument({
    this.idDocumentContainerScans,
    this.statusDeleteOnDb,
    this.resultDeleteFiles,
  });

  factory DeleteDocument.fromJson(Map<String, dynamic> json) => DeleteDocument(
        idDocumentContainerScans: json["idDocumentContainerScans"],
        statusDeleteOnDb: json["statusDeleteOnDB"],
        resultDeleteFiles: json["resultDeleteFiles"],
      );

  Map<String, dynamic> toJson() => {
        "idDocumentContainerScans": idDocumentContainerScans,
        "statusDeleteOnDB": statusDeleteOnDb,
        "resultDeleteFiles": resultDeleteFiles,
      };
}

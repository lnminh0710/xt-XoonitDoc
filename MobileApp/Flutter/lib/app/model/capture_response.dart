import 'dart:convert';

List<CaptureResponse> captureResponseFromJson(String str) =>
    List<CaptureResponse>.from(
        json.decode(str).map((x) => CaptureResponse.fromJson(x)));

String captureResponseToJson(List<CaptureResponse> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class CaptureResponse {
  String documentName;
  String scannedPath;
  String documentType;
  String numberOfImages;
  String createDate;
  String idDocumentContainerScans;

  CaptureResponse({
    this.documentName,
    this.scannedPath,
    this.documentType,
    this.numberOfImages,
    this.createDate,
    this.idDocumentContainerScans,
  });

  factory CaptureResponse.fromJson(Map<String, dynamic> json) =>
      CaptureResponse(
        documentName: json["DocumentName"],
        scannedPath: json["ScannedPath"],
        documentType: json["DocumentType"],
        numberOfImages: json["NumberOfImages"],
        createDate: json["CreateDate"],
        idDocumentContainerScans: json["IdDocumentContainerScans"],
      );

  Map<String, dynamic> toJson() => {
        "DocumentName": documentName,
        "ScannedPath": scannedPath,
        "DocumentType": documentType,
        "NumberOfImages": numberOfImages,
        "CreateDate": createDate,
        "IdDocumentContainerScans": idDocumentContainerScans,
      };
}

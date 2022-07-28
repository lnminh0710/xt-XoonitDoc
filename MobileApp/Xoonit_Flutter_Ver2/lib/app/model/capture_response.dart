// To parse this JSON data, do
//
//     final getDocumentResponse = getDocumentResponseFromJson(jsonString);

import 'dart:convert';

GetDocumentResponse getDocumentResponseFromJson(String str) => GetDocumentResponse.fromJson(json.decode(str));

String getDocumentResponseToJson(GetDocumentResponse data) => json.encode(data.toJson());

class GetDocumentResponse {
    GetDocumentResponse({
        this.totalRecords,
        this.data,
    });

    int totalRecords;
    List<Capture> data;

    factory GetDocumentResponse.fromJson(Map<String, dynamic> json) => GetDocumentResponse(
        totalRecords: json["TotalRecords"],
        data: List<Capture>.from(json["Data"].map((x) => Capture.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "TotalRecords": totalRecords,
        "Data": List<dynamic>.from(data.map((x) => x.toJson())),
    };
}

class Capture {
    Capture({
        this.documentName,
        this.scannedPath,
        this.documentType,
        this.numberOfImages,
        this.createDate,
        this.idDocumentContainerScans,
    });

    String documentName;
    String scannedPath;
    String documentType;
    String numberOfImages;
    String createDate;
    String idDocumentContainerScans;

    factory Capture.fromJson(Map<String, dynamic> json) => Capture(
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

// To parse this JSON data, do
//
//     final scanResult = scanResultFromJson(jsonString);

import 'dart:convert';

ScanResult scanResultFromJson(String str) => ScanResult.fromJson(json.decode(str));

String scanResultToJson(ScanResult data) => json.encode(data.toJson());

class ScanResult {
    ScanResult({
        this.idDocumentTree,
        this.imgPath,
    });

    int idDocumentTree;
    String imgPath;

    factory ScanResult.fromJson(Map<String, dynamic> json) => ScanResult(
        idDocumentTree: json["idDocumentTree"],
        imgPath: json["imgPath"],
    );

    Map<String, dynamic> toJson() => {
        "idDocumentTree": idDocumentTree,
        "imgPath": imgPath,
    };
}

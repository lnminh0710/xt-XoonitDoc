import 'dart:convert';

RotateDocumentRequest ocrDocumentRequestFromJson(String str) => RotateDocumentRequest.fromJson(json.decode(str));

String ocrDocumentRequestToJson(RotateDocumentRequest data) => json.encode(data.toJson());

class RotateDocumentRequest {
    RotateDocumentRequest({
        this.ocrDocs,
    });

    List<RotateDocument> ocrDocs;

    factory RotateDocumentRequest.fromJson(Map<String, dynamic> json) => RotateDocumentRequest(
        ocrDocs: List<RotateDocument>.from(json["OcrDocs"].map((x) => RotateDocument.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "OcrDocs": List<dynamic>.from(ocrDocs.map((x) => x.toJson())),
    };
}

class RotateDocument {
    RotateDocument({
        this.idMainDocument,
        this.indexName,
        this.ocrId,
        this.rotate,
        this.idDocumentContainerScans,
    });

    dynamic idMainDocument;
    String indexName;
    int ocrId;
    int rotate;
    int idDocumentContainerScans;

    factory RotateDocument.fromJson(Map<String, dynamic> json) => RotateDocument(
        idMainDocument: json["IdMainDocument"],
        indexName: json["IndexName"],
        ocrId: json["OcrId"],
        rotate: json["Rotate"],
        idDocumentContainerScans: json["IdDocumentContainerScans"],
    );

    Map<String, dynamic> toJson() => {
        "IdMainDocument": idMainDocument,
        "IndexName": indexName,
        "OcrId": ocrId,
        "Rotate": rotate,
        "IdDocumentContainerScans": idDocumentContainerScans,
    };
}

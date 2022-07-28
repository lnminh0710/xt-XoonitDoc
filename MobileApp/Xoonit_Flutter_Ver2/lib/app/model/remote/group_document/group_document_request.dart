import 'dart:convert';

List<GroupDocumentRequestItem> groupDocumentRequestFromJson(String str) => List<GroupDocumentRequestItem>.from(json.decode(str).map((x) => GroupDocumentRequestItem.fromJson(x)));

String groupDocumentRequestToJson(List<GroupDocumentRequestItem> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class GroupDocumentRequestItem {
    GroupDocumentRequestItem({
        this.idMainDocument,
        this.indexName,
        this.pageNr,
        this.idDocumentContainerOcr,
        this.oldIdDocumentContainerScans,
        this.idDocumentContainerScans,
        this.oldScannedPath,
        this.oldFileName,
        this.scannedPath,
    });

    dynamic idMainDocument;
    String indexName;
    int pageNr;
    String idDocumentContainerOcr;
    String oldIdDocumentContainerScans;
    int idDocumentContainerScans;
    String oldScannedPath;
    String oldFileName;
    String scannedPath;

    factory GroupDocumentRequestItem.fromJson(Map<String, dynamic> json) => GroupDocumentRequestItem(
        idMainDocument: json["IdMainDocument"],
        indexName: json["IndexName"],
        pageNr: json["PageNr"],
        idDocumentContainerOcr: json["IdDocumentContainerOcr"],
        oldIdDocumentContainerScans: json["OldIdDocumentContainerScans"],
        idDocumentContainerScans: json["IdDocumentContainerScans"],
        oldScannedPath: json["OldScannedPath"],
        oldFileName: json["OldFileName"],
        scannedPath: json["ScannedPath"],
    );

    Map<String, dynamic> toJson() => {
        "IdMainDocument": idMainDocument,
        "IndexName": indexName,
        "PageNr": pageNr,
        "IdDocumentContainerOcr": idDocumentContainerOcr,
        "OldIdDocumentContainerScans": oldIdDocumentContainerScans,
        "IdDocumentContainerScans": idDocumentContainerScans,
        "OldScannedPath": oldScannedPath,
        "OldFileName": oldFileName,
        "ScannedPath": scannedPath,
    };
}

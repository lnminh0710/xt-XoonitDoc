class DocumentTreeMedia {
    DocumentTreeMedia({
        this.idDocumentTreeMedia,
        this.idDocumentTree,
        this.idRepTreeMediaType,
        this.mediaName,
        this.cloudMediaPath,
    });

    dynamic idDocumentTreeMedia;
    String idDocumentTree;
    String idRepTreeMediaType;
    String mediaName;
    String cloudMediaPath;

    factory DocumentTreeMedia.fromJson(Map<String, dynamic> json) => DocumentTreeMedia(
        idDocumentTreeMedia: json["idDocumentTreeMedia"],
        idDocumentTree: json["idDocumentTree"],
        idRepTreeMediaType: json["idRepTreeMediaType"],
        mediaName: json["mediaName"],
        cloudMediaPath: json["cloudMediaPath"],
    );

    Map<String, dynamic> toJson() => {
        "idDocumentTreeMedia": idDocumentTreeMedia,
        "idDocumentTree": idDocumentTree,
        "idRepTreeMediaType": idRepTreeMediaType,
        "mediaName": mediaName,
        "cloudMediaPath": cloudMediaPath,
    };
}
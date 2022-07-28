class OtherDocuments {
  OtherDocuments({
    this.idDocumentContainerScans,
    this.idDocumentTree,
  });

  String idDocumentContainerScans;
  String idDocumentTree;

  factory OtherDocuments.fromJson(Map<String, dynamic> json) => OtherDocuments(
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idDocumentTree: json["idDocumentTree"],
      );

  Map<String, dynamic> toJson() => {
        "idDocumentContainerScans": idDocumentContainerScans,
        "idDocumentTree": idDocumentTree,
      };
}

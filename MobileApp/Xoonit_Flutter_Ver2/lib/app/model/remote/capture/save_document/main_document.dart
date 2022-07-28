class MainDocument {
  MainDocument({
    this.idMainDocument,
    this.idDocumentContainerScans,
    this.searchKeyWords,
    this.notes,
    this.isTodo,
    this.mainDocumentTree,
  });

  dynamic idMainDocument;
  String idDocumentContainerScans;
  String searchKeyWords;
  String notes;
  String isTodo;
  MainDocumentTree mainDocumentTree;

  factory MainDocument.fromJson(Map<String, dynamic> json) => MainDocument(
        idMainDocument: json["idMainDocument"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        searchKeyWords: json["searchKeyWords"],
        notes: json["toDoNotes"],
        isTodo: json['isTodo'],
        mainDocumentTree: MainDocumentTree.fromJson(json["mainDocumentTree"]),
      );

  Map<String, dynamic> toJson() => {
        "idMainDocument": idMainDocument,
        "idDocumentContainerScans": idDocumentContainerScans,
        "searchKeyWords": searchKeyWords,
        "toDoNotes": notes,
        'isTodo': isTodo,
        "mainDocumentTree": mainDocumentTree.toJson(),
      };
}

class MainDocumentTree {
  MainDocumentTree({
    this.idDocumentTree,
    this.oldFolder,
    this.newFolder,
  });

  String idDocumentTree;
  dynamic oldFolder;
  dynamic newFolder;

  factory MainDocumentTree.fromJson(Map<String, dynamic> json) =>
      MainDocumentTree(
        idDocumentTree: json["idDocumentTree"],
        oldFolder: json["oldFolder"],
        newFolder: json["newFolder"],
      );

  Map<String, dynamic> toJson() => {
        "idDocumentTree": idDocumentTree,
        "oldFolder": oldFolder,
        "newFolder": newFolder,
      };
}

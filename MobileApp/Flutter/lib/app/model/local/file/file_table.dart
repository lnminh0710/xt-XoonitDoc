class TFile {
  int id, documentID;
  String name, path;

  TFile({
    this.id,
    this.documentID,
    this.name,
    this.path,
  });

  static const sqlCreate = '''CREATE TABLE TFile (
    id INTEGER PRIMARY KEY,
    documentID INTEGER,
    name TEXT,
    path TEXT)''';

  factory TFile.fromJson(Map<String, dynamic> json) => TFile(
        id: json["id"],
        documentID: json["documentID"],
        name: json["name"],
        path: json["path"],
      );

  toJson() => {
        "id": id,
        "documentID": documentID,
        "name": name,
        "path": path,
      };
}

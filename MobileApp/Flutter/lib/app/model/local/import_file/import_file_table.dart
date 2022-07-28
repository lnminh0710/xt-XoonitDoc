
class TImportFile {
  int id;
  String name, type, path;
  String size;
  // String docTreeID;

  // UI
  bool isSelect = false;

  TImportFile({
    this.id,
    this.name,
    this.path,
    this.size,
    this.type,
    // this.docTreeID,
  });

  static const sqlCreate = '''CREATE TABLE TImportFile (
    id INTEGER PRIMARY KEY autoincrement,
    name TEXT,
    path TEXT,
    size TEXT,
    type TEXT
    )''';

  factory TImportFile.fromJson(Map<String, dynamic> json) => TImportFile(
        id: json["id"],
        name: json["name"],
        path: json["path"],
        type: json["type"],
        size: json["size"],
        // docTreeID: json["docTreeID"],
      );

  toJson() => {
        "id": id,
        "name": name,
        "path": path,
        "size": size,
        "type": type,
        // "docTreeID": docTreeID,
      };
}

import 'dart:convert';

TDocument documentTableFromJson(String str) =>
    TDocument.fromJson(json.decode(str));

String documentTableToJson(TDocument data) => json.encode(data.toJson());

class TDocument {
  int id;
  String name, lotName, createDate, clientOpenDateUTC, dateInImage, note, imagePath;
  bool isSynced, isSelected;

  static const sqlCreate = '''CREATE TABLE TDocument (
        id INTEGER PRIMARY KEY autoincrement,
        name TEXT,
        lotName TEXT,
        createDate,
        clientOpenDateUTC TEXT,
        dateInImage TEXT,
        note TEXT,
        imagePath TEXT,
        isSynced BIT)''';

  TDocument(
      {this.id,
      this.name,
      this.lotName,
      this.createDate,
      this.clientOpenDateUTC,
      this.isSelected = false,
      this.dateInImage,
      this.note,
      this.imagePath,
      this.isSynced});

  factory TDocument.fromJson(Map<String, dynamic> json) => TDocument(
        id: json["id"],
        name: json["name"],
        lotName: json["lotName"],
        createDate: json["createDate"],
        clientOpenDateUTC: json["clientOpenDateUTC"],
        dateInImage: json["dateInImage"],
        note: json["note"],
        imagePath: json["imagePath"],
        isSynced: json["isSynced"],
      );

  toJson() => {
        "id": id,
        "name": name,
        "lotName": lotName,
        "createDate": createDate,
        "clientOpenDateUTC": clientOpenDateUTC,
        "dateInImage": dateInImage,
        "note": note,
        "imagePath": imagePath,
        "isSynced": isSynced,
      };
}

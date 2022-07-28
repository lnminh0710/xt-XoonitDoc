import 'package:hive/hive.dart';

part 'document_table.g.dart';

@HiveType()
class TDocument extends HiveObject {
  @HiveField(0)
  String uuid;
  @HiveField(1)
  int docTreeId;
  @HiveField(2)
  String name;
  @HiveField(3)
  String lotName;
  @HiveField(4)
  String createDate;
  @HiveField(5)
  String clientOpenDateUTC;
  @HiveField(6)
  String dateInImage;
  @HiveField(7)
  String note;
  @HiveField(8)
  String imagePath;
  @HiveField(9)
  String docTreeName;
  bool isSelected;
  bool isUploadFailed;

  TDocument(
      {this.uuid,
      this.docTreeId,
      this.name,
      this.docTreeName,
      this.lotName,
      this.createDate,
      this.clientOpenDateUTC,
      this.dateInImage,
      this.note,
      this.imagePath,
      this.isUploadFailed = false,
      this.isSelected = false});
}

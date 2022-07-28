import 'package:hive/hive.dart';
part 'document_table.g.dart';

@HiveType(typeId: 2)
class TDocument extends HiveObject {
  @HiveField(0)
  String uuid;
  @HiveField(1)
  String name;
  @HiveField(2)
  String lotName;
  @HiveField(3)
  String createDate;
  @HiveField(4)
  String clientOpenDateUTC;
  @HiveField(5)
  String dateInImage;
  @HiveField(6)
  String note;
  @HiveField(7)
  String imagePath;

  bool isSelected;
  bool isUploadFailed;

  TDocument(
      {this.uuid,
      this.name,
      this.lotName,
      this.createDate,
      this.clientOpenDateUTC,
      this.dateInImage,
      this.note,
      this.imagePath,
      this.isUploadFailed = false,
      this.isSelected = false});
}

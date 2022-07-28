import 'package:hive/hive.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
part 'container_table.g.dart';

@HiveType(typeId: 1)
class TContainer extends HiveObject {
  @HiveField(0)
  String uuid;
  @HiveField(1)
  String note;

  @HiveField(2)
  List<TDocument> documents = [];

  bool isSelected;
  bool isUploadFailed;

  TContainer(
      {this.uuid,
      this.note,
      this.documents,
      this.isSelected = false,
      this.isUploadFailed = false});
}

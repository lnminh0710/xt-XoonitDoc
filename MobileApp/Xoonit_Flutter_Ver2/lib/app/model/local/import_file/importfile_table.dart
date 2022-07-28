import 'package:hive/hive.dart';
part 'importfile_table.g.dart';

@HiveType(typeId: 4)
class TImportFile extends HiveObject {
  @HiveField(0)
  String uuid;
  @HiveField(1)
  String name;
  @HiveField(2)
  String path;
  @HiveField(3)
  String size;
  @HiveField(4)
  String type;

  int uploadProgress = -1;

  TImportFile({this.uuid, this.name, this.path, this.size, this.type});
}

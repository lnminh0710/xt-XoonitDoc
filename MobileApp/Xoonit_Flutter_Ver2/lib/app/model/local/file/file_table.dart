import 'package:hive/hive.dart';
part 'file_table.g.dart';

@HiveType(typeId: 3)
class TFile extends HiveObject {
  @HiveField(0)
  String uuid;
  @HiveField(1)
  int documentID;
  @HiveField(2)
  String name;
  @HiveField(3)
  String path;

  TFile({
    this.uuid,
    this.documentID,
    this.name,
    this.path,
  });
}

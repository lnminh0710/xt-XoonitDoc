import 'dart:convert';

import 'package:hive/hive.dart';

import '../document/document_table.dart';

part 'container_table.g.dart';

@HiveType()
class TContainer extends HiveObject {
  @HiveField(0)
  String uuid;
  @HiveField(1)
  int docTreeId;
  @HiveField(2)
  String note;
  @HiveField(3)
  String docTreeName;
  bool isSelected;
  bool isUploadFailed;

  @HiveField(4)
  List<TDocument> documents = [];

  TContainer(
      {this.uuid, this.docTreeId, this.docTreeName, this.note ="", this.isSelected = false, this.isUploadFailed = false});
}

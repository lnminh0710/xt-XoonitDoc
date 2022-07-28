import 'dart:io';

import 'package:hive/hive.dart';
import 'package:caminada/app/model/local/container/container_table.dart';
import 'package:path_provider/path_provider.dart';

import '../../model/local/document/document_table.dart';

class DatabaseManager {
  static const DocumentBoxKey = 'documentboxkey';
  static Box<TDocument> documentBox;

  static const ContainerBoxKey = 'containerboxkey';
  static Box containerBox;

  static init() async {
    final appDocumentDirectory = await getApplicationDocumentsDirectory();
    Hive
      ..init(appDocumentDirectory.path)
      ..registerAdapter(TDocumentAdapter())
      ..registerAdapter(TContainerAdapter());

    documentBox = await Hive.openBox<TDocument>(DocumentBoxKey);
    containerBox = await Hive.openBox(ContainerBoxKey);
  }

  static clearData() {
    documentBox.clear();
    containerBox.clear();
  }
}

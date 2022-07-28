import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:xoonit/app/model/local/container/container_table.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/model/local/file/file_table.dart';
import 'package:xoonit/app/model/local/import_file/importfile_table.dart';

class DatabaseManager {
  static const DocumentBoxKey = "documentboxkey";
  static Box<TDocument> documentBox;

  static const ContainerBoxKey = "containerboxkey";
  static Box<TContainer> containerBox;

  static const FileBoxKey = "fileboxkey";
  static Box<TFile> fileBox;

  static const ImportFileBoxKey = "import_fileboxkey";
  static Box<TImportFile> importFileBox;

  static init() async {
    var dir = await getApplicationDocumentsDirectory();
    Hive
      ..init(dir.path)
      ..registerAdapter(TDocumentAdapter())
      ..registerAdapter(TContainerAdapter())
      ..registerAdapter(TFileAdapter())
      ..registerAdapter(TImportFileAdapter());
    documentBox = await Hive.openBox<TDocument>(DocumentBoxKey);
    containerBox = await Hive.openBox<TContainer>(ContainerBoxKey);
    fileBox = await Hive.openBox<TFile>(FileBoxKey);
    importFileBox = await Hive.openBox<TImportFile>(ImportFileBoxKey);
  }

  static clearDatabase(){
    documentBox.clear();
    containerBox.clear();
    fileBox.clear();
    importFileBox.clear();
  }
}

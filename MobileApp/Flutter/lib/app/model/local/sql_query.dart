import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/model/local/file/file_table.dart';
import 'package:xoonit/app/model/local/import_file/import_file_table.dart';

enum Table { TDocument, TFile, TImportFile }

extension TableExtension on Table {
  get name {
    return this.toString();
  }

  get sqlCreate {
    switch (this) {
      case Table.TDocument:
        return TDocument.sqlCreate;
      case Table.TFile:
        return TFile.sqlCreate;
      case Table.TImportFile:
        return TImportFile.sqlCreate;
    }
  }
}

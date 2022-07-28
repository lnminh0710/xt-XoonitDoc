import 'package:uuid/uuid.dart';
import 'package:xoonit/app/model/local/import_file/importfile_table.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

class ImportFileDAO {
  static List<TImportFile> getAllFileImport() {
    var list = DatabaseManager?.importFileBox?.values?.toList();
    return list != null && list.isNotEmpty ? list : [];
  }

  static insert(TImportFile file) {
    file.uuid ??= Uuid().v4();
    DatabaseManager.importFileBox.put(file.uuid, file);
  }

  static delete({String uuid, TImportFile file}) {
    DatabaseManager.importFileBox.delete(uuid ?? file.uuid);
  }
}

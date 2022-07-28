import 'package:uuid/uuid.dart';
import 'package:xoonit/app/model/local/file/file_table.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

class FileDAO {
  static List<TFile> getAllFile() {
    var list = DatabaseManager.fileBox.values.toList();
    return list != null && list.isNotEmpty ? list : [];
  }

  static insertFile(TFile file) {
    file.uuid ??= Uuid().v4();
    DatabaseManager.fileBox.put(file.uuid, file);
  }

  static deleteFile({String uuid, TFile file}) {
    DatabaseManager.fileBox.delete(uuid ?? file.uuid);
  }
}

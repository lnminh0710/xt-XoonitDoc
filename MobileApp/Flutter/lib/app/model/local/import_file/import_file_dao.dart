import 'package:xoonit/app/model/local/import_file/import_file_table.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

class ImportFileDAO {
  static insert(TImportFile file) async {
    var result = await DatabaseManager.instance.insert(file);
    return result;
  }

  static Future<List<TImportFile>> getAll() async {
    var rs = await DatabaseManager.instance.getAll<TImportFile>();
    final List<Map<String, dynamic>> result = rs.toList();

    return result.isNotEmpty
        ? result.map((v) => TImportFile.fromJson(v)).toList()
        : [];
  }

  static deleteByID(int fileID) async {
    var result =
        await DatabaseManager.instance.deleteBy<TImportFile>("id = ?", [fileID]);
    return result;
  }
}

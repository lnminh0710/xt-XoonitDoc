
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

class DocumentDAO {
  static Future<List<TDocument>> getAll() async {
    var rs = await DatabaseManager.instance.getAll<TDocument>();
    final List<Map<String, dynamic>> result = rs.toList();

    return result.isNotEmpty
        ? result.map((v) => TDocument.fromJson(v)).toList()
        : [];
  }

  static insert(TDocument doc) async {
    var result = await DatabaseManager.instance.insert(doc);
    return result;
  }

  static getByID(int docID) async {
    var result =
        await DatabaseManager.instance.getBy<TDocument>("id = ?", [docID]);
    return result;
  }

  static deleteByID(int docID) async {
    var result =
        await DatabaseManager.instance.deleteBy<TDocument>("id = ?", [docID]);
    return result;
  }
}
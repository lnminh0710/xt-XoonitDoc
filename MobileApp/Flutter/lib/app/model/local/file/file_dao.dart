import 'package:xoonit/app/model/local/file/file_table.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

class FileDAO {

  static getFileByDocumentID(int docID) async {
    var result = await DatabaseManager.instance.getBy<TFile>("documentID = ?", [docID]);
    var ls = result.toList();
    return ls.isNotEmpty ? ls.map((f) => TFile.fromJson(f)) : [];
  }

  static insert(TFile file) async {
    var result = await DatabaseManager.instance.insert(file);
    return result;
  }
}

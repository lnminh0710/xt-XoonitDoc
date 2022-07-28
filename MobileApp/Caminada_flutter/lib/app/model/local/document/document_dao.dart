import 'package:uuid/uuid.dart';
import 'package:caminada/app/model/local/document/document_table.dart';
import 'package:caminada/app/utils/database/database_manager.dart';

class DocumentDAO {
  static List<TDocument> getAll() {
    return DatabaseManager.documentBox.values.toList();
  }

  static insert(TDocument doc) async {
    doc.uuid ??= Uuid().v4();
    return DatabaseManager.documentBox.put(doc.uuid, doc);
  }

  static delete({String uuid, TDocument document}) async {
    return DatabaseManager.documentBox.delete(uuid ?? document.uuid);
  }
}

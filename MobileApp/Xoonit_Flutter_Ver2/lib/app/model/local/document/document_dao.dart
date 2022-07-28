import 'package:uuid/uuid.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

class DocumentDAO {
  static List<TDocument> getAllDocument() {
    return DatabaseManager.documentBox.values.toList();
  }

  static insert(TDocument document) {
    document.uuid ??= Uuid().v4();
    return DatabaseManager.documentBox.put(document.uuid, document);
  }

  static delete({String uuid, TDocument document}) {
    return DatabaseManager.documentBox.delete(uuid ?? document.uuid);
  }
}

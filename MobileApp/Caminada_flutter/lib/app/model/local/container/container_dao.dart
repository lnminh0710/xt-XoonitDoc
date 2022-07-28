import 'dart:convert';

import 'package:caminada/app/model/local/document/document_dao.dart';
import 'package:uuid/uuid.dart';
import 'package:caminada/app/model/local/container/container_table.dart';
import 'package:caminada/app/utils/database/database_manager.dart';

import '../document/document_table.dart';

class ContainerDAO {
  static List<TContainer> getAll() {
    return DatabaseManager.containerBox.values
        .map((e) => e is TContainer ? e : null)
        .where((e) => e != null)
        .toList();
  }

  // Group Document
  static insert(TContainer container, List<TDocument> lsChild) async {
    container.uuid ??= Uuid().v4();

    lsChild.forEach((child) {
      DocumentDAO.delete(document: child);
    });
    lsChild.forEach((element) {
      DatabaseManager.containerBox.put(element.uuid, element);
    });
    container.documents.addAll(lsChild);
    return DatabaseManager.containerBox.put(container.uuid, container);
  }

  //Ungroup Document
  static delete(TContainer container) async {
    container.documents.forEach((element) {
      DatabaseManager.containerBox.delete(element.uuid);
    });
    return DatabaseManager.containerBox.delete(container.uuid);
  }

  static unGroupDocument(TContainer container) {
    
    container.documents.forEach((doc) {
      DatabaseManager.containerBox.delete(doc.uuid);
      DatabaseManager.documentBox.put(doc.uuid, doc);
    });
    return DatabaseManager.containerBox.delete(container.uuid);
  }
}

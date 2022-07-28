import 'package:uuid/uuid.dart';
import 'package:xoonit/app/utils/database/database_manager.dart';

import 'container_table.dart';

class ContainerDAO {
  static List<TContainer> getAllContainer() {
    return DatabaseManager.containerBox.values.toList();
  }

  static insert(TContainer container) {
    container.uuid ??= Uuid().v4();
    DatabaseManager.containerBox.put(container.uuid, container);
  }

  static delete({String uuid, TContainer container}) {
    DatabaseManager.containerBox.delete(uuid ?? container.uuid);
  }
}

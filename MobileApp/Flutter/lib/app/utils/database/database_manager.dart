import 'dart:io';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:xoonit/app/model/local/sql_query.dart';

class DatabaseManager {
  static var _databaseName = "Xoonit.db";
  static var _databaseVersion = 1;

  DatabaseManager._();
  static final DatabaseManager instance = DatabaseManager._();

  static Database _database;
  Future<Database> get database async => _database ??= await _initDatabase();

  _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, _databaseName);
    return await openDatabase(path,
        version: _databaseVersion, onCreate: _onCreate);
  }

  _onCreate(Database db, int version) async {
    try {
      for (var table in Table.values) {
        await db.execute(table.sqlCreate);
      }
    } catch (err) {}
  }

  insert<Table extends dynamic>(Table obj) async {
    try {
      final db = await DatabaseManager.instance.database;
      var results = await db.insert(obj.runtimeType.toString(), obj.toJson());

      return results;
    } catch (err) {
      Future.error(err);
    }
  }

  updateBy<Table>(Table obj, String condition, List<dynamic> args) async {
    try {
      final db = await database;
      var results = await db.query(obj.runtimeType.toString(),
          where: condition, whereArgs: args);
      return results;
    } catch (err) {
      Future.error(err);
    }
  }

  getAll<Table>() async {
    try {
      final db = await database;
      var result = await db.rawQuery('SELECT * FROM ${Table.toString()}');
      return result;
    } catch (err) {
      Future.error(err);
    }
  }

  getBy<Table>(String condition, List<dynamic> args) async {
    try {
      final db = await database;
      var result = await db.rawQuery('SELECT * FROM ${Table.toString()}');
      return result;
    } catch (err) {
      Future.error(err);
    }
  }

  deleteBy<Table>(String condition, List<dynamic> args) async {
    try {
      final db = await database;
      return db.delete("${Table.toString()}", where: condition, whereArgs: args);
    } catch (err) {
      Future.error(err);
    }
  }

  deleteAll<Table>() async {
    try {
      final db = await database;
      db.delete("${Table.toString()}");
    } catch (err) {
      Future.error(err);
    }
  }

  clean() {}
}

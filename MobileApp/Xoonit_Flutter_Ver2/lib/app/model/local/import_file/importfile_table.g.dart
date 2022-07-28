// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'importfile_table.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TImportFileAdapter extends TypeAdapter<TImportFile> {
  @override
  final int typeId = 4;

  @override
  TImportFile read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return TImportFile(
      uuid: fields[0] as String,
      name: fields[1] as String,
      path: fields[2] as String,
      size: fields[3] as String,
      type: fields[4] as String,
    );
  }

  @override
  void write(BinaryWriter writer, TImportFile obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.uuid)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.path)
      ..writeByte(3)
      ..write(obj.size)
      ..writeByte(4)
      ..write(obj.type);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TImportFileAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

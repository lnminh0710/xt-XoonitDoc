// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'file_table.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TFileAdapter extends TypeAdapter<TFile> {
  @override
  final int typeId = 3;

  @override
  TFile read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return TFile(
      uuid: fields[0] as String,
      documentID: fields[1] as int,
      name: fields[2] as String,
      path: fields[3] as String,
    );
  }

  @override
  void write(BinaryWriter writer, TFile obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.uuid)
      ..writeByte(1)
      ..write(obj.documentID)
      ..writeByte(2)
      ..write(obj.name)
      ..writeByte(3)
      ..write(obj.path);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TFileAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

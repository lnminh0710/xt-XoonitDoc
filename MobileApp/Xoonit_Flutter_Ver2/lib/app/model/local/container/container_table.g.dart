// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'container_table.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TContainerAdapter extends TypeAdapter<TContainer> {
  @override
  final int typeId = 1;

  @override
  TContainer read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return TContainer(
      uuid: fields[0] as String,
      note: fields[1] as String,
      documents: (fields[2] as List)?.cast<TDocument>(),
    );
  }

  @override
  void write(BinaryWriter writer, TContainer obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.uuid)
      ..writeByte(1)
      ..write(obj.note)
      ..writeByte(2)
      ..write(obj.documents);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TContainerAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

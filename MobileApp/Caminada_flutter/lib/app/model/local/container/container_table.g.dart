// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'container_table.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TContainerAdapter extends TypeAdapter<TContainer> {
  @override
  TContainer read(BinaryReader reader) {
    var numOfFields = reader.readByte();
    var fields = <int, dynamic>{
      for (var i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return TContainer(
      uuid: fields[0] as String,
      docTreeId: fields[1] as int,
      docTreeName: fields[3] as String,
      note: fields[2] as String,
    )..documents = (fields[4] as List)?.cast<TDocument>();
  }

  @override
  void write(BinaryWriter writer, TContainer obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.uuid)
      ..writeByte(1)
      ..write(obj.docTreeId)
      ..writeByte(2)
      ..write(obj.note)
      ..writeByte(3)
      ..write(obj.docTreeName)
      ..writeByte(4)
      ..write(obj.documents);
  }

  @override
  // TODO: implement typeId
  int get typeId => 1;
}

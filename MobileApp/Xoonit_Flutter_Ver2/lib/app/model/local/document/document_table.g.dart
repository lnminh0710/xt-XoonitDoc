// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'document_table.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TDocumentAdapter extends TypeAdapter<TDocument> {
  @override
  final int typeId = 2;

  @override
  TDocument read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return TDocument(
      uuid: fields[0] as String,
      name: fields[1] as String,
      lotName: fields[2] as String,
      createDate: fields[3] as String,
      clientOpenDateUTC: fields[4] as String,
      dateInImage: fields[5] as String,
      note: fields[6] as String,
      imagePath: fields[7] as String,
    );
  }

  @override
  void write(BinaryWriter writer, TDocument obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.uuid)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.lotName)
      ..writeByte(3)
      ..write(obj.createDate)
      ..writeByte(4)
      ..write(obj.clientOpenDateUTC)
      ..writeByte(5)
      ..write(obj.dateInImage)
      ..writeByte(6)
      ..write(obj.note)
      ..writeByte(7)
      ..write(obj.imagePath);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TDocumentAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

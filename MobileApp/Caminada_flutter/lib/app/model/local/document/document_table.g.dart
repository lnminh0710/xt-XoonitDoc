// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'document_table.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TDocumentAdapter extends TypeAdapter<TDocument> {
  @override
  TDocument read(BinaryReader reader) {
    var numOfFields = reader.readByte();
    var fields = <int, dynamic>{
      for (var i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return TDocument(
      uuid: fields[0] as String,
      docTreeId: fields[1] as int,
      name: fields[2] as String,
      docTreeName: fields[9] as String,
      lotName: fields[3] as String,
      createDate: fields[4] as String,
      clientOpenDateUTC: fields[5] as String,
      dateInImage: fields[6] as String,
      note: fields[7] as String,
      imagePath: fields[8] as String,
    );
  }

  @override
  void write(BinaryWriter writer, TDocument obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.uuid)
      ..writeByte(1)
      ..write(obj.docTreeId)
      ..writeByte(2)
      ..write(obj.name)
      ..writeByte(3)
      ..write(obj.lotName)
      ..writeByte(4)
      ..write(obj.createDate)
      ..writeByte(5)
      ..write(obj.clientOpenDateUTC)
      ..writeByte(6)
      ..write(obj.dateInImage)
      ..writeByte(7)
      ..write(obj.note)
      ..writeByte(8)
      ..write(obj.imagePath)
      ..writeByte(9)
      ..write(obj.docTreeName);
  }

  @override
  // TODO: implement typeId
  int get typeId => 0;
}

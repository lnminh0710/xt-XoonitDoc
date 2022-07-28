import 'dart:convert';

List<Communication> communicationFromJson(String str) =>
    List<Communication>.from(
        json.decode(str).map((x) => Communication.fromJson(x)));

String communicationToJson(List<Communication> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class Communication {
  int idSharingCommunication;
  String defaultValue;
  String commValue1;
  dynamic isMainCommunication;

  Communication({
    this.idSharingCommunication,
    this.defaultValue,
    this.commValue1,
    this.isMainCommunication,
  });

  factory Communication.fromJson(Map<String, dynamic> json) => Communication(
        idSharingCommunication: json["IdSharingCommunication"],
        defaultValue: json["DefaultValue"],
        commValue1: json["CommValue1"],
        isMainCommunication: json["IsMainCommunication"],
      );

  Map<String, dynamic> toJson() => {
        "IdSharingCommunication": idSharingCommunication,
        "DefaultValue": defaultValue,
        "CommValue1": commValue1,
        "IsMainCommunication": isMainCommunication,
      };
}

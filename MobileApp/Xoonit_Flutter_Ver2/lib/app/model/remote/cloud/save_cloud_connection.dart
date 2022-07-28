import 'package:xoonit/app/model/remote/cloud/cloud_connection_response.dart';

class SaveCloudConnection {
  SaveCloudConnection({
    this.idCloudConnection,
    this.idApplicationOwner,
    this.idCloudProviders,
    this.connectionString,
    this.clientId,
    this.userEmail,
    this.myDmEmail,
    this.userName,
    this.password,
    this.isActive,
    this.isDeleted,
    this.createDate,
    this.updateDate,
  });

  dynamic idCloudConnection;
  dynamic idApplicationOwner;
  String idCloudProviders;
  CloudConnection connectionString;
  String clientId;
  String userEmail;
  String myDmEmail;
  String userName;
  String password;
  bool isActive;
  bool isDeleted;
  String createDate;
  String updateDate;

  factory SaveCloudConnection.fromJson(Map<String, dynamic> json) =>
      SaveCloudConnection(
        idCloudConnection: json["IdCloudConnection"],
        idApplicationOwner: json["IdApplicationOwner"],
        idCloudProviders: json["IdCloudProviders"],
        connectionString: CloudConnection.fromJson(json["ConnectionString"]),
        clientId: json["ClientId"],
        userEmail: json["UserEmail"],
        myDmEmail: json["MyDmEmail"],
        userName: json["UserName"],
        password: json["Password"],
        isActive: json["IsActive"],
        isDeleted: json["IsDeleted"],
        createDate: json["CreateDate"],
        updateDate: json["UpdateDate"],
      );

  Map<String, dynamic> toJson() => {
        "IdCloudConnection": idCloudConnection,
        "IdApplicationOwner": idApplicationOwner,
        "IdCloudProviders": idCloudProviders,
        "ConnectionString": connectionString?.toJson(),
        "ClientId": clientId,
        "UserEmail": userEmail,
        "MyDmEmail": myDmEmail,
        "UserName": userName,
        "Password": password,
        "IsActive": isActive,
        "IsDeleted": isDeleted,
        "CreateDate": createDate,
        "UpdateDate": updateDate,
      };
}

class SaveCloudConnectionResponse {
  SaveCloudConnectionResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  final int statusCode;
  final dynamic resultDescription;
  final Item item;

  factory SaveCloudConnectionResponse.fromJson(Map<String, dynamic> json) =>
      SaveCloudConnectionResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: Item.fromJson(json["item"]),
      );

  Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": item.toJson(),
      };
}

class Item {
  Item({
    this.returnId,
    this.eventType,
    this.sqlStoredMessage,
    this.isSuccess,
    this.payload,
  });

  final String returnId;
  final String eventType;
  final dynamic sqlStoredMessage;
  final bool isSuccess;
  final dynamic payload;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        returnId: json["returnID"],
        eventType: json["eventType"],
        sqlStoredMessage: json["sqlStoredMessage"],
        isSuccess: json["isSuccess"],
        payload: json["payload"],
      );

  Map<String, dynamic> toJson() => {
        "returnID": returnId,
        "eventType": eventType,
        "sqlStoredMessage": sqlStoredMessage,
        "isSuccess": isSuccess,
        "payload": payload,
      };
}

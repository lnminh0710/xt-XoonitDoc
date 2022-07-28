import 'dart:convert';

class CloudConnectionResponse {
  CloudConnectionResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  final int statusCode;
  final dynamic resultDescription;
  final Item item;

  factory CloudConnectionResponse.fromJson(Map<String, dynamic> json) =>
      CloudConnectionResponse(
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
  Item(
      {this.idCloudConnection,
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
      this.connection});

  final dynamic idCloudConnection;
  final dynamic idApplicationOwner;
  final int idCloudProviders;
  final dynamic connectionString;
  final String clientId;
  final String userEmail;
  final String myDmEmail;
  final String userName;
  final String password;
  final dynamic isActive;
  final dynamic isDeleted;
  final String createDate;
  final String updateDate;
  final CloudConnection connection;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
      idCloudConnection: json["IdCloudConnection"],
      idApplicationOwner: json["IdApplicationOwner"],
      idCloudProviders: json["IdCloudProviders"],
      connectionString: json["ConnectionString"],
      clientId: json["ClientId"],
      userEmail: json["UserEmail"],
      myDmEmail: json["MyDmEmail"],
      userName: json["UserName"],
      password: json["Password"],
      isActive: json["IsActive"],
      isDeleted: json["IsDeleted"],
      createDate: json["CreateDate"],
      updateDate: json["UpdateDate"],
      connection: (json["ConnectionString"] as String)?.isEmpty == true
          ? null
          : CloudConnection.fromJson(jsonDecode(json["ConnectionString"])));

  Map<String, dynamic> toJson() => {
        "IdCloudConnection": idCloudConnection,
        "IdApplicationOwner": idApplicationOwner,
        "IdCloudProviders": idCloudProviders,
        "ConnectionString": connectionString,
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

class CloudConnection {
  CloudConnection({
    this.userEmail,
    this.sharedFolder,
    this.sharedLink,
    this.fileServerFolder,
    this.sftpConnection,
    this.ftpConnection,
  });

  final String userEmail;
  final String sharedFolder;
  final String sharedLink;
  final dynamic fileServerFolder;
  final dynamic sftpConnection;
  final dynamic ftpConnection;

  factory CloudConnection.fromJson(Map<String, dynamic> json) =>
      CloudConnection(
        userEmail: json["UserEmail"],
        sharedFolder: json["SharedFolder"],
        sharedLink: json["SharedLink"],
        fileServerFolder: json["FileServerFolder"],
        sftpConnection: json["SftpConnection"],
        ftpConnection: json["FtpConnection"],
      );

  Map<String, dynamic> toJson() => {
        "UserEmail": userEmail,
        "SharedFolder": sharedFolder,
        "SharedLink": sharedLink,
        "FileServerFolder": fileServerFolder,
        "SftpConnection": sftpConnection,
        "FtpConnection": ftpConnection,
      };
}

class CloudActiviesResponse {
  CloudActiviesResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  final int statusCode;
  final dynamic resultDescription;
  final Item item;

  factory CloudActiviesResponse.fromJson(Map<String, dynamic> json) =>
      CloudActiviesResponse(
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
    this.collectionData,
    this.data,
  });

  final List<CollectionData> collectionData;
  final dynamic data;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        collectionData: List<CollectionData>.from(
            json["collectionData"].map((x) => CollectionData.fromJson(x))),
        data: json["data"],
      );

  Map<String, dynamic> toJson() => {
        "collectionData":
            List<dynamic>.from(collectionData.map((x) => x.toJson())),
        "data": data,
      };
}

class CollectionData {
  CollectionData({
    this.idCloudProviders,
    this.idCloudConnection,
    this.providerName,
    this.userName,
    this.isActive,
  });

  final IdCloudConnection idCloudProviders;
  final IdCloudConnection idCloudConnection;
  final IdCloudConnection providerName;
  final IdCloudConnection userName;
  final IdCloudConnection isActive;

  factory CollectionData.fromJson(Map<String, dynamic> json) => CollectionData(
        idCloudProviders: IdCloudConnection.fromJson(json["idCloudProviders"]),
        idCloudConnection:
            IdCloudConnection.fromJson(json["idCloudConnection"]),
        providerName: IdCloudConnection.fromJson(json["providerName"]),
        userName: IdCloudConnection.fromJson(json["userName"]),
        isActive: IdCloudConnection.fromJson(json["isActive"]),
      );

  Map<String, dynamic> toJson() => {
        "idCloudProviders": idCloudProviders.toJson(),
        "idCloudConnection": idCloudConnection.toJson(),
        "providerName": providerName.toJson(),
        "userName": userName.toJson(),
        "isActive": isActive.toJson(),
      };
}

class IdCloudConnection {
  IdCloudConnection({
    this.displayValue,
    this.value,
    this.originalComlumnName,
  });

  final String displayValue;
  final String value;
  final String originalComlumnName;

  factory IdCloudConnection.fromJson(Map<String, dynamic> json) =>
      IdCloudConnection(
        displayValue: json["displayValue"],
        value: json["value"],
        originalComlumnName: json["originalComlumnName"],
      );

  Map<String, dynamic> toJson() => {
        "displayValue": displayValue,
        "value": value,
        "originalComlumnName": originalComlumnName,
      };
}

class TestConnectionRequest {
  TestConnectionRequest({
    this.userEmail,
    this.sharedFolder,
    this.sharedLink,
    this.cloudType,
  });

  final String userEmail;
  final String sharedFolder;
  final String sharedLink;
  final String cloudType;

  factory TestConnectionRequest.fromJson(Map<String, dynamic> json) =>
      TestConnectionRequest(
        userEmail: json["UserEmail"],
        sharedFolder: json["SharedFolder"],
        sharedLink: json["SharedLink"],
        cloudType: json["CloudType"],
      );

  Map<String, dynamic> toJson() => {
        "UserEmail": userEmail,
        "SharedFolder": sharedFolder,
        "SharedLink": sharedLink,
        "CloudType": cloudType,
      };
}

class TestConnectionResponse {
  TestConnectionResponse({
    this.statusCode,
    this.resultDescription,
    this.item,
  });

  final int statusCode;
  final dynamic resultDescription;
  final Item item;

  factory TestConnectionResponse.fromJson(Map<String, dynamic> json) =>
      TestConnectionResponse(
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
    this.errorMessage,
    this.isSuccess,
  });

  final dynamic errorMessage;
  final bool isSuccess;

  factory Item.fromJson(Map<String, dynamic> json) => Item(
        errorMessage: json["errorMessage"],
        isSuccess: json["isSuccess"],
      );

  Map<String, dynamic> toJson() => {
        "errorMessage": errorMessage,
        "isSuccess": isSuccess,
      };
}

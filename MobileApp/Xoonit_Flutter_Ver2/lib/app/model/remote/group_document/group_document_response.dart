import 'dart:convert';

GroupDocumentResponse groupDocumentResponseFromJson(String str) => GroupDocumentResponse.fromJson(json.decode(str));

String groupDocumentResponseToJson(GroupDocumentResponse data) => json.encode(data.toJson());

class GroupDocumentResponse {
    GroupDocumentResponse({
        this.returnId,
        this.eventType,
        this.sqlStoredMessage,
        this.isSuccess,
        this.payload,
    });

    String returnId;
    String eventType;
    dynamic sqlStoredMessage;
    bool isSuccess;
    dynamic payload;

    factory GroupDocumentResponse.fromJson(Map<String, dynamic> json) => GroupDocumentResponse(
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

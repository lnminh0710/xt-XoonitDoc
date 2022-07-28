import 'dart:convert';

RotateDocumentResponse ocrDocumentResponseFromJson(String str) => RotateDocumentResponse.fromJson(json.decode(str));

String ocrDocumentResponseToJson(RotateDocumentResponse data) => json.encode(data.toJson());

class RotateDocumentResponse {
    RotateDocumentResponse({
        this.message,
    });

    List<Message> message;

    factory RotateDocumentResponse.fromJson(Map<String, dynamic> json) => RotateDocumentResponse(
        message: List<Message>.from(json["Message"].map((x) => Message.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "Message": List<dynamic>.from(message.map((x) => x.toJson())),
    };
}

class Message {
    Message({
        this.ocrId,
        this.status,
    });

    String ocrId;
    String status;

    factory Message.fromJson(Map<String, dynamic> json) => Message(
        ocrId: json["OcrId"],
        status: json["Status"],
    );

    Map<String, dynamic> toJson() => {
        "OcrId": ocrId,
        "Status": status,
    };
}

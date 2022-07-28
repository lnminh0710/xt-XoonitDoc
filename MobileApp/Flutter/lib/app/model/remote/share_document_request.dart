import 'dart:convert';

ShareDocumentRequest shareDocumentRequestFromJson(String str) =>
    ShareDocumentRequest.fromJson(json.decode(str));

String shareDocumentRequestToJson(ShareDocumentRequest data) =>
    json.encode(data.toJson());

class ShareDocumentRequest {
  ShareDocumentRequest({
    this.toEmail,
    this.subject,
    this.body,
    this.idDocumentContainerScans,
  });

  String toEmail;
  String subject;
  String body;
  String idDocumentContainerScans;

  factory ShareDocumentRequest.fromJson(Map<String, dynamic> json) =>
      ShareDocumentRequest(
        toEmail: json["ToEmail"],
        subject: json["Subject"],
        body: json["Body"],
        idDocumentContainerScans: json["IdDocumentContainerScans"],
      );

  Map<String, dynamic> toJson() => {
        "ToEmail": toEmail,
        "Subject": subject,
        "Body": body,
        "IdDocumentContainerScans": idDocumentContainerScans,
      };
}

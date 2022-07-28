// To parse this JSON data, do
//
//     final createFolderRequest = createFolderRequestFromJson(jsonString);

import 'dart:convert';

CreateFolderRequest createFolderRequestFromJson(String str) => CreateFolderRequest.fromJson(json.decode(str));

String createFolderRequestToJson(CreateFolderRequest data) => json.encode(data.toJson());

class CreateFolderRequest {
    CreateFolderRequest({
        this.idDocumentParent,
        this.idDocumentType,
        this.name,
        this.order,
        this.children,
        this.hasChildren,
        this.isAfterAdjacentRoot,
        this.mode,
        this.id,
    });

    int idDocumentParent;
    int idDocumentType;
    String name;
    int order;
    dynamic children;
    bool hasChildren;
    bool isAfterAdjacentRoot;
    String mode;
    int id;

    factory CreateFolderRequest.fromJson(Map<String, dynamic> json) => CreateFolderRequest(
        idDocumentParent: json["idDocumentParent"],
        idDocumentType: json["idDocumentType"],
        name: json["name"],
        order: json["order"],
        children: json["children"],
        hasChildren: json["hasChildren"],
        isAfterAdjacentRoot: json["isAfterAdjacentRoot"],
        mode: json["mode"],
        id: json["id"],
    );

    Map<String, dynamic> toJson() => {
        "idDocumentParent": idDocumentParent,
        "idDocumentType": idDocumentType,
        "name": name,
        "order": order,
        "children": children,
        "hasChildren": hasChildren,
        "isAfterAdjacentRoot": isAfterAdjacentRoot,
        "mode": mode,
        "id": id,
    };
}

// To parse this JSON data, do
//
//     final documentTreeResponse = documentTreeResponseFromJson(jsonString);

import 'dart:convert';

class DocumentTreeResponse {
    int statusCode;
    String resultDescription;
    List<DocumentTreeItem> item;

    DocumentTreeResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory DocumentTreeResponse.fromRawJson(String str) => DocumentTreeResponse.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory DocumentTreeResponse.fromJson(Map<String, dynamic> json) => DocumentTreeResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: List<DocumentTreeItem>.from(json["item"].map((x) => DocumentTreeItem.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(item.map((x) => x.toJson())),
    };
}

class DocumentTreeItem {
    List<DocumentTreeItem> children;
    Data data;
    dynamic root;

    DocumentTreeItem({
        this.children,
        this.data,
        this.root,
    });

    factory DocumentTreeItem.fromRawJson(String str) => DocumentTreeItem.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory DocumentTreeItem.fromJson(Map<String, dynamic> json) => DocumentTreeItem(
        children: json["children"] == null ? null : List<DocumentTreeItem>.from(json["children"].map((x) => DocumentTreeItem.fromJson(x))),
        data: Data.fromJson(json["data"]),
        root: json["root"],
    );

    Map<String, dynamic> toJson() => {
        "children": children == null ? null : List<dynamic>.from(children.map((x) => x.toJson())),
        "data": data.toJson(),
        "root": root,
    };
}

class Data {
    int idDocumentTree;
    int idDocumentTreeParent;
    int idRepDocumentGuiType;
    String groupName;
    int sortingIndex;
    dynamic iconName;
    int quantity;
    int quantityParent;
    bool isActive;
    bool isReadOnly;

    Data({
        this.idDocumentTree,
        this.idDocumentTreeParent,
        this.idRepDocumentGuiType,
        this.groupName,
        this.sortingIndex,
        this.iconName,
        this.quantity,
        this.quantityParent,
        this.isActive,
        this.isReadOnly,
    });

    factory Data.fromRawJson(String str) => Data.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory Data.fromJson(Map<String, dynamic> json) => Data(
        idDocumentTree: json["idDocumentTree"],
        idDocumentTreeParent: json["idDocumentTreeParent"] == null ? null : json["idDocumentTreeParent"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        groupName: json["groupName"],
        sortingIndex: json["sortingIndex"],
        iconName: json["iconName"],
        quantity: json["quantity"],
        quantityParent: json["quantityParent"],
        isActive: json["isActive"],
        isReadOnly: json["isReadOnly"],
    );

    Map<String, dynamic> toJson() => {
        "idDocumentTree": idDocumentTree,
        "idDocumentTreeParent": idDocumentTreeParent == null ? null : idDocumentTreeParent,
        "idRepDocumentGuiType": idRepDocumentGuiType,
        "groupName": groupName,
        "sortingIndex": sortingIndex,
        "iconName": iconName,
        "quantity": quantity,
        "quantityParent": quantityParent,
        "isActive": isActive,
        "isReadOnly": isReadOnly,
    };
}

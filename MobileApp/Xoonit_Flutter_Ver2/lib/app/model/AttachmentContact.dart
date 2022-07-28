// To parse this JSON data, do
//
//     final attachmentContact = attachmentContactFromJson(jsonString);

import 'dart:convert';

AttachmentContact attachmentContactFromJson(String str) => AttachmentContact.fromJson(json.decode(str));

String attachmentContactToJson(AttachmentContact data) => json.encode(data.toJson());

class AttachmentContact {
    AttachmentContact({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    int statusCode;
    dynamic resultDescription;
    AttachmentContactItem item;

    factory AttachmentContact.fromJson(Map<String, dynamic> json) => AttachmentContact(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        item: AttachmentContactItem.fromJson(json["item"]),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": item.toJson(),
    };
}

class AttachmentContactItem {
    AttachmentContactItem({
        this.pageIndex,
        this.pageSize,
        this.total,
        this.results,
        this.setting,
        this.payload,
    });

    int pageIndex;
    int pageSize;
    int total;
    List<AttachmentContactItemResult> results;
    List<List<Setting>> setting;
    dynamic payload;

    factory AttachmentContactItem.fromJson(Map<String, dynamic> json) => AttachmentContactItem(
        pageIndex: json["pageIndex"],
        pageSize: json["pageSize"],
        total: json["total"],
        results: List<AttachmentContactItemResult>.from(json["results"].map((x) => AttachmentContactItemResult.fromJson(x))),
        setting: List<List<Setting>>.from(json["setting"].map((x) => List<Setting>.from(x.map((x) => Setting.fromJson(x))))),
        payload: json["payload"],
    );

    Map<String, dynamic> toJson() => {
        "pageIndex": pageIndex,
        "pageSize": pageSize,
        "total": total,
        "results": List<dynamic>.from(results.map((x) => x.toJson())),
        "setting": List<dynamic>.from(setting.map((x) => List<dynamic>.from(x.map((x) => x.toJson())))),
        "payload": payload,
    };
}

class AttachmentContactItemResult {
    AttachmentContactItemResult({
        this.idMainDocument,
        this.idApplicationOwner,
        this.idDocumentContainerScans,
        this.idDocumentTree,
        this.isActive,
        this.isDeleted,
        this.isSync,
        this.idCloudConnection,
        this.idRepDocumentGuiType,
        this.rootName,
        this.groupName,
        this.scannedPath,
        this.scannedFilename,
        this.numberOfImages,
        this.notes,
        this.mediaName,
        this.contacts,
        this.searchKeyWords,
        this.fullText,
        this.id,
    });

    String idMainDocument;
    int idApplicationOwner;
    int idDocumentContainerScans;
    int idDocumentTree;
    bool isActive;
    bool isDeleted;
    bool isSync;
    String idCloudConnection;
    String idRepDocumentGuiType;
    String rootName;
    String groupName;
    String scannedPath;
    String scannedFilename;
    int numberOfImages;
    String notes;
    String mediaName;
    List<Contact> contacts;
    String searchKeyWords;
    List<FullText> fullText;
    int id;

    factory AttachmentContactItemResult.fromJson(Map<String, dynamic> json) => AttachmentContactItemResult(
        idMainDocument: json["idMainDocument"],
        idApplicationOwner: json["idApplicationOwner"],
        idDocumentContainerScans: json["idDocumentContainerScans"],
        idDocumentTree: json["idDocumentTree"],
        isActive: json["isActive"],
        isDeleted: json["isDeleted"],
        isSync: json["isSync"],
        idCloudConnection: json["idCloudConnection"],
        idRepDocumentGuiType: json["idRepDocumentGuiType"],
        rootName: json["rootName"],
        groupName: json["groupName"],
        scannedPath: json["scannedPath"],
        scannedFilename: json["scannedFilename"],
        numberOfImages: json["numberOfImages"],
        notes: json["notes"],
        mediaName: json["mediaName"],
        contacts: List<Contact>.from(json["contacts"].map((x) => Contact.fromJson(x))),
        searchKeyWords: json["searchKeyWords"],
        fullText: List<FullText>.from(json["fullText"].map((x) => FullText.fromJson(x))),
        id: json["id"],
    );

    Map<String, dynamic> toJson() => {
        "idMainDocument": idMainDocument,
        "idApplicationOwner": idApplicationOwner,
        "idDocumentContainerScans": idDocumentContainerScans,
        "idDocumentTree": idDocumentTree,
        "isActive": isActive,
        "isDeleted": isDeleted,
        "isSync": isSync,
        "idCloudConnection": idCloudConnection,
        "idRepDocumentGuiType": idRepDocumentGuiType,
        "rootName": rootName,
        "groupName": groupName,
        "scannedPath": scannedPath,
        "scannedFilename": scannedFilename,
        "numberOfImages": numberOfImages,
        "notes": notes,
        "mediaName": mediaName,
        "contacts": List<dynamic>.from(contacts.map((x) => x.toJson())),
        "searchKeyWords": searchKeyWords,
        "fullText": List<dynamic>.from(fullText.map((x) => x.toJson())),
        "id": id,
    };
}

class Contact {
    Contact({
        this.idPerson,
        this.personNr,
        this.personType,
        this.documentType,
    });

    String idPerson;
    String personNr;
    String personType;
    String documentType;

    factory Contact.fromJson(Map<String, dynamic> json) => Contact(
        idPerson: json["idPerson"],
        personNr: json["personNr"],
        personType: json["personType"],
        documentType: json["documentType"],
    );

    Map<String, dynamic> toJson() => {
        "idPerson": idPerson,
        "personNr": personNr,
        "personType": personType,
        "documentType": documentType,
    };
}

class FullText {
    FullText({
        this.oCrText,
    });

    String oCrText;

    factory FullText.fromJson(Map<String, dynamic> json) => FullText(
        oCrText: json["oCRText"],
    );

    Map<String, dynamic> toJson() => {
        "oCRText": oCrText,
    };
}

class Setting {
    Setting({
        this.settingColumnName,
    });

    String settingColumnName;

    factory Setting.fromJson(Map<String, dynamic> json) => Setting(
        settingColumnName: json["SettingColumnName"],
    );

    Map<String, dynamic> toJson() => {
        "SettingColumnName": settingColumnName,
    };
}

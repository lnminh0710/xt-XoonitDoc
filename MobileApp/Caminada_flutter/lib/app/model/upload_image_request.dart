// To parse this JSON data, do
//
//     final uploadImageRequest = uploadImageRequestFromJson(jsonString);

import 'dart:convert';

UploadImageRequest uploadImageRequestFromJson(String str) => UploadImageRequest.fromJson(json.decode(str));

String uploadImageRequestToJson(UploadImageRequest data) => json.encode(data.toJson());

class UploadImageRequest {
    UploadImageRequest({
        this.images,
        this.scanningLotItemData,
    });

    List<ImageUpload> images;
    ScanningLotItemData scanningLotItemData;

    factory UploadImageRequest.fromJson(Map<String, dynamic> json) => UploadImageRequest(
        images: List<ImageUpload>.from(json["Images"].map((x) => ImageUpload.fromJson(x))),
        scanningLotItemData: ScanningLotItemData.fromJson(json["ScanningLotItemData"]),
    );

    Map<String, dynamic> toJson() => {
        "Images": List<dynamic>.from(images.map((x) => x.toJson())),
        "ScanningLotItemData": scanningLotItemData.toJson(),
    };
}

class ImageUpload {
    ImageUpload({
        this.fileName,
        this.pageNr,
        this.base64String,
    });

    String fileName;
    int pageNr;
    String base64String;

    factory ImageUpload.fromJson(Map<String, dynamic> json) => ImageUpload(
        fileName: json["FileName"],
        pageNr: json["PageNr"],
        base64String: json["base64_string"],
    );

    Map<String, dynamic> toJson() => {
        "FileName": fileName,
        "PageNr": pageNr,
        "base64_string": base64String,
    };
}

class ScanningLotItemData {
    ScanningLotItemData({
        this.coordinatePageNr,
        this.customerNr,
        this.idDocumentTree,
        this.idRepScanDeviceType,
        this.idRepScansContainerType,
        this.idScansContainer,
        this.idScansContainerItem,
        this.isActive,
        this.isOnlyGamer,
        this.isSynced,
        this.isUserClicked,
        this.lotId,
        this.mediaCode,
        this.numberOfImages,
        this.groupUuid,
        this.scannedDateUtc,
        this.sourceScanGuid,
    });

    int coordinatePageNr;
    String customerNr;
    String idDocumentTree;
    int idRepScanDeviceType;
    int idRepScansContainerType;
    int idScansContainer;
    int idScansContainerItem;
    String isActive;
    String isOnlyGamer;
    bool isSynced;
    bool isUserClicked;
    int lotId;
    String mediaCode;
    int numberOfImages;
    String scannedDateUtc;
    String sourceScanGuid;
    String groupUuid;

    factory ScanningLotItemData.fromJson(Map<String, dynamic> json) => ScanningLotItemData(
        coordinatePageNr: json["CoordinatePageNr"],
        customerNr: json["CustomerNr"],
        idDocumentTree: json["IdDocumentTree"],
        idRepScanDeviceType: json["IdRepScanDeviceType"],
        idRepScansContainerType: json["IdRepScansContainerType"],
        idScansContainer: json["IdScansContainer"],
        idScansContainerItem: json["IdScansContainerItem"],
        isActive: json["IsActive"],
        isOnlyGamer: json["IsOnlyGamer"],
        isSynced: json["IsSynced"],
        isUserClicked: json["IsUserClicked"],
        lotId: json["LotId"],
        mediaCode: json["MediaCode"],
        groupUuid: json["GroupUuid"],
        numberOfImages: json["NumberOfImages"],
        scannedDateUtc: json["ScannedDateUTC"],
        sourceScanGuid: json["SourceScanGUID"],
    );

    Map<String, dynamic> toJson() => {
        "CoordinatePageNr": coordinatePageNr,
        "CustomerNr": customerNr,
        "IdDocumentTree": idDocumentTree,
        "IdRepScanDeviceType": idRepScanDeviceType,
        "IdRepScansContainerType": idRepScansContainerType,
        "IdScansContainer": idScansContainer,
        "IdScansContainerItem": idScansContainerItem,
        "IsActive": isActive,
        "IsOnlyGamer": isOnlyGamer,
        "IsSynced": isSynced,
        "IsUserClicked": isUserClicked,
        "LotId": lotId,
        "MediaCode": mediaCode,
        "NumberOfImages": numberOfImages,
        "ScannedDateUTC": scannedDateUtc,
        "SourceScanGUID": sourceScanGuid,
        "GroupUuid": groupUuid
    };
}

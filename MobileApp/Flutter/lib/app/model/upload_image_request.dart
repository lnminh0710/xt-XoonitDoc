// To parse this JSON data, do
//
//     final uploadImageRequest = uploadImageRequestFromJson(jsonString);

import 'dart:convert';

class UploadImageRequest {
    List<ImageUpload> images;
    ScanningLotItemData scanningLotItemData;

    UploadImageRequest({
        this.images,
        this.scanningLotItemData,
    });

    factory UploadImageRequest.fromRawJson(String str) => UploadImageRequest.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

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

    String fileName;
    int pageNr;
    String base64String;

    int idLocal;

    ImageUpload({
        this.fileName,
        this.pageNr,
        this.base64String,
        this.idLocal
    });

    factory ImageUpload.fromRawJson(String str) => ImageUpload.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory ImageUpload.fromJson(Map<String, dynamic> json) => ImageUpload(
        fileName: json["FileName"],
        pageNr: json["PageNr"],
        base64String: json["Base64_string"],
        idLocal: json["idLocal"],
    );

    Map<String, dynamic> toJson() => {
        "FileName": fileName,
        "PageNr": pageNr,
        "Base64_string": base64String,
        "idLocal": idLocal,
    };
}

class ScanningLotItemData {
    int coordinatePageNr;
    String customerNr;
    int idRepScanDeviceType;
    int idRepScansContainerType;
    int idScansContainer;
    int idScansContainerItem;
    String isActive;
    String isOnlyGamer;
    bool isSynced;
    bool isUserClicked;
    int lotId;
    bool isLocalDeleted;
    String mediaCode;
    int numberOfImages;
    String scannedDateUtc;
    String sourceScanGuid;

    ScanningLotItemData({
        this.coordinatePageNr,
        this.customerNr,
        this.idRepScanDeviceType,
        this.idRepScansContainerType,
        this.idScansContainer,
        this.idScansContainerItem,
        this.isActive,
        this.isOnlyGamer,
        this.isSynced,
        this.isUserClicked,
        this.lotId,
        this.isLocalDeleted,
        this.mediaCode,
        this.numberOfImages,
        this.scannedDateUtc,
        this.sourceScanGuid,
    });

    factory ScanningLotItemData.fromRawJson(String str) => ScanningLotItemData.fromJson(json.decode(str));

    String toRawJson() => json.encode(toJson());

    factory ScanningLotItemData.fromJson(Map<String, dynamic> json) => ScanningLotItemData(
        coordinatePageNr: json["CoordinatePageNr"],
        customerNr: json["CustomerNr"],
        idRepScanDeviceType: json["IdRepScanDeviceType"],
        idRepScansContainerType: json["IdRepScansContainerType"],
        idScansContainer: json["IdScansContainer"],
        idScansContainerItem: json["IdScansContainerItem"],
        isActive: json["IsActive"],
        isOnlyGamer: json["IsOnlyGamer"],
        isSynced: json["IsSynced"],
        isUserClicked: json["IsUserClicked"],
        lotId: json["LotId"],
        isLocalDeleted: json["IsLocalDeleted"],
        mediaCode: json["MediaCode"],
        numberOfImages: json["NumberOfImages"],
        scannedDateUtc: json["ScannedDateUTC"],
        sourceScanGuid: json["SourceScanGUID"],
    );

    Map<String, dynamic> toJson() => {
        "CoordinatePageNr": coordinatePageNr,
        "CustomerNr": customerNr,
        "IdRepScanDeviceType": idRepScanDeviceType,
        "IdRepScansContainerType": idRepScansContainerType,
        "IdScansContainer": idScansContainer,
        "IdScansContainerItem": idScansContainerItem,
        "IsActive": isActive,
        "IsOnlyGamer": isOnlyGamer,
        "IsSynced": isSynced,
        "IsUserClicked": isUserClicked,
        "LotId": lotId,
        "IsLocalDeleted": isLocalDeleted,
        "MediaCode": mediaCode,
        "NumberOfImages": numberOfImages,
        "ScannedDateUTC": scannedDateUtc,
        "SourceScanGUID": sourceScanGuid,
    };
}

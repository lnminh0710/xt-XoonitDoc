import 'dart:convert';

class OrderScanning {
  OrderScanning({
    this.lotItemId,
    this.idRepScansContainerType,
    this.idRepScanDeviceType,
    this.isSendToCapture,
    this.idDocumentTree,
    this.scannerTwainDllVersion,
    this.scannerDevice,
    this.customerNr,
    this.mediaCode,
    this.scannedPath,
    this.scannedFilename,
    this.scannedDateUtc,
    this.coordinateX,
    this.coordinateY,
    this.coordinatePageNr,
    this.isWhiteMail,
    this.isCheque,
    this.numberOfImages,
    this.sourceScanGuid,
    this.isMediaCodeValid,
    this.isCustomerNrValid,
    this.isCustomerNrEnteredManually,
    this.isMediaCodeEnteredManually,
    this.isSynced,
    this.isActive,
    this.isUserClicked,
    this.elapsedTime,
    this.isLocalDeleted,
    this.isOnlyGamer,
    this.idRepScansDocumentType,
    this.notes,
  });

  final dynamic lotItemId;
  final int idRepScansContainerType;
  final int idRepScanDeviceType;
  final String isSendToCapture;
  final String idDocumentTree;
  final dynamic scannerTwainDllVersion;
  final dynamic scannerDevice;
  final String customerNr;
  final String mediaCode;
  final dynamic scannedPath;
  final dynamic scannedFilename;
  final String scannedDateUtc;
  final dynamic coordinateX;
  final dynamic coordinateY;
  final int coordinatePageNr;
  final dynamic isWhiteMail;
  final dynamic isCheque;
  final int numberOfImages;
  final String sourceScanGuid;
  final dynamic isMediaCodeValid;
  final dynamic isCustomerNrValid;
  final dynamic isCustomerNrEnteredManually;
  final dynamic isMediaCodeEnteredManually;
  final bool isSynced;
  final String isActive;
  final bool isUserClicked;
  final dynamic elapsedTime;
  final dynamic isLocalDeleted;
  final dynamic isOnlyGamer;
  final int idRepScansDocumentType;
  final dynamic notes;

  factory OrderScanning.fromJson(Map<String, dynamic> json) => OrderScanning(
        lotItemId: json["LotItemId"],
        idRepScansContainerType: json["IdRepScansContainerType"],
        idRepScanDeviceType: json["IdRepScanDeviceType"],
        isSendToCapture: json["IsSendToCapture"],
        idDocumentTree: json["IdDocumentTree"],
        scannerTwainDllVersion: json["ScannerTwainDllVersion"],
        scannerDevice: json["ScannerDevice"],
        customerNr: json["CustomerNr"],
        mediaCode: json["MediaCode"],
        scannedPath: json["ScannedPath"],
        scannedFilename: json["ScannedFilename"],
        scannedDateUtc: json["ScannedDateUTC"],
        coordinateX: json["CoordinateX"],
        coordinateY: json["CoordinateY"],
        coordinatePageNr: json["CoordinatePageNr"],
        isWhiteMail: json["IsWhiteMail"],
        isCheque: json["IsCheque"],
        numberOfImages: json["NumberOfImages"],
        sourceScanGuid: json["SourceScanGUID"],
        isMediaCodeValid: json["IsMediaCodeValid"],
        isCustomerNrValid: json["IsCustomerNrValid"],
        isCustomerNrEnteredManually: json["IsCustomerNrEnteredManually"],
        isMediaCodeEnteredManually: json["IsMediaCodeEnteredManually"],
        isSynced: json["IsSynced"],
        isActive: json["IsActive"],
        isUserClicked: json["IsUserClicked"],
        elapsedTime: json["ElapsedTime"],
        isLocalDeleted: json["IsLocalDeleted"],
        isOnlyGamer: json["IsOnlyGamer"],
        idRepScansDocumentType: json["IdRepScansDocumentType"],
        notes: json["Notes"],
      );

  Map<String, dynamic> toJson() => {
        "LotItemId": lotItemId,
        "IdRepScansContainerType": idRepScansContainerType,
        "IdRepScanDeviceType": idRepScanDeviceType,
        "IsSendToCapture": isSendToCapture,
        "IdDocumentTree": idDocumentTree,
        "ScannerTwainDllVersion": scannerTwainDllVersion,
        "ScannerDevice": scannerDevice,
        "CustomerNr": customerNr,
        "MediaCode": mediaCode,
        "ScannedPath": scannedPath,
        "ScannedFilename": scannedFilename,
        "ScannedDateUTC": scannedDateUtc,
        "CoordinateX": coordinateX,
        "CoordinateY": coordinateY,
        "CoordinatePageNr": coordinatePageNr,
        "IsWhiteMail": isWhiteMail,
        "IsCheque": isCheque,
        "NumberOfImages": numberOfImages,
        "SourceScanGUID": sourceScanGuid,
        "IsMediaCodeValid": isMediaCodeValid,
        "IsCustomerNrValid": isCustomerNrValid,
        "IsCustomerNrEnteredManually": isCustomerNrEnteredManually,
        "IsMediaCodeEnteredManually": isMediaCodeEnteredManually,
        "IsSynced": isSynced,
        "IsActive": isActive,
        "IsUserClicked": isUserClicked,
        "ElapsedTime": elapsedTime,
        "IsLocalDeleted": isLocalDeleted,
        "IsOnlyGamer": isOnlyGamer,
        "IdRepScansDocumentType": idRepScansDocumentType,
        "Notes": notes,
      };
}

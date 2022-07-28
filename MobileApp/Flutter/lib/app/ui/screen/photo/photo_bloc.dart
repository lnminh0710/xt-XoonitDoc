import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:rxdart/rxdart.dart';
import 'package:uuid/uuid.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/local/document/document_dao.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/model/upload_image_request.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/ui/dialog/dialog_review_image.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class PhotoBloc extends BlocBase {
  final BehaviorSubject<List<TDocument>> _documentList =
      BehaviorSubject<List<TDocument>>.seeded(null);
  Stream<List<TDocument>> get documentList => _documentList.stream;

  final BehaviorSubject<bool> _selectedMode =
      BehaviorSubject<bool>.seeded(false);
  Stream<bool> get selectedMode => _selectedMode.stream;

  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  @override
  void dispose() {
    closeStream();
  }

  void closeStream() {
    _documentList?.close();
    _selectedMode?.close();
    _screenState?.close();
  }

  PhotoBloc() {
    getAllDocumentFromLocal();
  }

  void getAllDocumentFromLocal() {
    DocumentDAO.getAll().then((onValue) {
      List<bool> documentStatus = new List<bool>();
      if (onValue != null) {
        onValue.forEach((document) {
          documentStatus.add(false);
        });
        _documentList.sink.add(onValue);
        _selectedMode.sink.add(false);
      }
    });
  }

  void setDocumentStatus(int index, bool value) {
    _documentList.value[index].isSelected = !value;
    _documentList.sink.add(_documentList.value);
  }

  void changeDocumentStatus(int index) {
    _documentList.value[index].isSelected =
        !_documentList.value[index].isSelected;
    _documentList.sink.add(_documentList.value);
  }

  void setSelectedMode(bool isSelectedMode) {
    _documentList.value.forEach((document) {
      document.isSelected = false;
    });
    _selectedMode.sink.add(isSelectedMode);
  }

  void reviewImage(int index, BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return ReviewImageDialog(
            listDocumentURL:
                List<String>.from([_documentList.value[index].imagePath]),
            isLocalImage: true,
            listDocumentName:
                List<String>.from([_documentList.value[index].name]),
          );
        });
  }

  Future<void> onUploadPhotoButtonPressed() async {
    _screenState.sink.add(AppState.Loading);
    for (int i = 0; i < _documentList.value.length; i++) {
      if (_documentList.value[i].isSelected) {
        UploadImageRequest request = createUploadObject(_documentList.value[i]);
        await appApiService.client
            .uploadImage(request.toJson())
            .then((onValue) {
          if (onValue?.item?.result?.isSuccess != null &&
              onValue.item.result.isSuccess) {
            DocumentDAO.deleteByID(_documentList.value[i].id);
          }
        });
      }
    }
    getAllDocumentFromLocal();
    _screenState.sink.add(AppState.Idle);
  }

  void deleteImageInLocal(int index, BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Message',
            message: 'Are you sure want delete this file?',
            onCancelButtonPressed: () {
              Navigator.of(context).pop();
            },
            onOKButtonPressed: () {
              DocumentDAO.deleteByID(_documentList.value[index].id);
              getAllDocumentFromLocal();
              Navigator.of(context).pop();
            },
          );
        });
  }

  UploadImageRequest createUploadObject(TDocument document) {
    File imgFile = File(document.imagePath);
    List<int> imageBytes = imgFile.readAsBytesSync();
    String imageB64 = base64Encode(imageBytes);
    List<ImageUpload> listImage = new List<ImageUpload>();
    final dateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss.sss');
    final dateInImageFormat = new DateFormat('ddMMyy_HHmmss');
    String timeString =
        dateInImageFormat.format(dateFormat.parse(document.createDate)) ?? '';
    String userName = XoonitApplication.instance.userInfo.userName ?? '';
    String fileName = userName + '_Invoices_' + timeString + '.tiff.png';
    listImage.add(
        ImageUpload(base64String: imageB64, fileName: fileName, pageNr: 1));
    return UploadImageRequest(
        images: listImage,
        scanningLotItemData: ScanningLotItemData(
            coordinatePageNr: 0,
            idRepScansContainerType: 1,
            idRepScanDeviceType: 2,
            customerNr: '1',
            mediaCode: '1',
            numberOfImages: 1,
            sourceScanGuid: Uuid().v4(),
            isSynced: true,
            scannedDateUtc: document.clientOpenDateUTC,
            isActive: '1',
            isUserClicked: true,
            idScansContainer: 0,
            idScansContainerItem: 0,
            isLocalDeleted: false,
            isOnlyGamer: '0',
            lotId: 0));
  }
}

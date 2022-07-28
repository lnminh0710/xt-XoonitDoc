import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:rxdart/rxdart.dart';
import 'package:uuid/uuid.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/local/document/document_dao.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/model/upload_image_request.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/ui/dialog/dialog_review_image.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class PhotoBloc extends BlocBase {
  final BehaviorSubject<List<TDocument>> _documentList =
      BehaviorSubject<List<TDocument>>.seeded(null);
  Stream<List<TDocument>> get documentList => _documentList.stream;

  final BehaviorSubject<bool> _selectionMode =
      BehaviorSubject<bool>.seeded(false);
  Stream<bool> get selectedMode => _selectionMode.stream;

  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  int _uploadSuccessCount = 0;
  int _uploadFailedCount = 0;
  @override
  void dispose() {
    closeStream();
  }

  void closeStream() {
    _documentList?.close();
    _selectionMode?.close();
    _screenState?.close();
  }

  PhotoBloc() {
    getAllDocumentFromLocal();
    if (_documentList?.value != null && _documentList.value.length == 0) {
      setSelectedMode(false);
    } else {
      setSelectedMode(true);
    }
  }

  void getAllDocumentFromLocal() async {
    var list = DocumentDAO.getAllDocument();
    List<bool> documentStatus = new List<bool>();
    if (list != null) {
      list.forEach((document) {
        documentStatus.add(false);
      });
      _documentList.sink.add(list);
    }
    if (_documentList?.value != null && _documentList.value.length == 0) {
      setSelectedMode(false);
    }
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
      document.isSelected = isSelectedMode;
    });
    _selectionMode.sink.add(isSelectedMode);
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
            isEditableDocument: false,
          );
        });
  }

  bool _isSelectedDocument() {
    if (!_selectionMode.value) {
      return false;
    } else {
      return getSelectedDoc() != null && getSelectedDoc().length > 0;
    }
  }

  List<TDocument> getSelectedDoc() {
    return _documentList.value.where((element) => element.isSelected).toList();
  }

  Future<void> _uploadImageToServer(BuildContext _context) async {
    _screenState.sink.add(AppState.Loading);
    for (int i = 0; i < _documentList.value.length; i++) {
      if (_documentList.value[i].isSelected) {
        UploadImageRequest request = createUploadObject(_documentList.value[i]);
        await appApiService.client
            .uploadImage(request.toJson())
            .then((onValue) {
          if (onValue?.item?.result?.isSuccess != null &&
              onValue.item.result.isSuccess) {
            _uploadSuccessCount++;
            File file = File(_documentList.value[i].imagePath);
            file.deleteSync();
            DocumentDAO.delete(uuid: _documentList.value[i].uuid);
          } else {
            _uploadFailedCount++;
            _documentList.value[i].isUploadFailed = true;
          }
        }).catchError((onError) {
          _uploadFailedCount++;
          _documentList.value[i].isUploadFailed = true;
        });
      }
    }
    _showDialogUploadResponse(_context);
    _screenState.sink.add(AppState.Idle);
  }

  void _showDialogUploadResponse(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Notice!',
            successMessage: _uploadSuccessCount.toString() +
                ' documents have been uploaded to server',
            faildMessage: _uploadFailedCount > 0
                ? _uploadFailedCount.toString() + ' document failed'
                : '',
            onOKButtonPressed: () {
              if (_uploadFailedCount == 0) {
                setSelectedMode(false);
              }
              Navigator.of(context).pop();
            },
          );
        }).then((value) {
      getAllDocumentFromLocal();
    });
  }

  void _showMustSelectDocumentDialog(BuildContext _context) {
    showDialog(
        context: _context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Information',
            message: 'You must select at least 1 document',
            onOKButtonPressed: () {
              Navigator.of(context).pop();
            },
          );
        });
  }

  Future<void> onUploadPhotoButtonPressed(BuildContext buildContext) async {
    if (_isSelectedDocument()) {
      showDialog(
          context: buildContext,
          builder: (BuildContext context) {
            return DialogMessage(
              message: "Do you want to upload these documents to server?",
              onOKButtonPressed: () {
                Navigator.of(context).pop();
                _uploadFailedCount = 0;
                _uploadSuccessCount = 0;
                _uploadImageToServer(buildContext);
              },
              onCancelButtonPressed: () {
                Navigator.of(context).pop();
              },
            );
          });
    } else {
      _showMustSelectDocumentDialog(buildContext);
    }
  }

  void selectAllDocument(bool isSelected) {
    _documentList.value.forEach((document) {
      document.isSelected = isSelected;
    });
    _documentList.sink.add(_documentList.value);
  }

  void deleteImageInLocal(int index, BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return NotificationDialog(
            iconImages: Image.asset(Resources.icDialogWarning),
            title: "Notice !",
            message: "Are you sure want delete this file?",
            possitiveButtonName: "Ok",
            possitiveButtonOnClick: (_) {
              DocumentDAO.delete(uuid: _documentList.value[index].uuid);
              getAllDocumentFromLocal();
              Navigator.of(context).pop();
            },
            negativeButtonName: "Cancel",
            nagativeButtonOnCLick: (_) {
              Navigator.of(context).pop();
            },
            body: SizedBox.shrink(),
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
    String fileName = document.name;
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

import 'dart:convert';
import 'dart:io';

import 'package:caminada/app/constants/constants_value.dart';
import 'package:caminada/app/model/local/container/container_dao.dart';
import 'package:caminada/app/model/local/container/container_table.dart';
import 'package:caminada/app/model/local/document/document_dao.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/model/upload_image_request.dart';
import 'package:caminada/app/model/upload_image_response.dart';
import 'package:caminada/app/routes/routes.dart';
import 'package:caminada/app/ui/component/custom_dialog_select_doctype.dart';
import 'package:caminada/app/ui/dialog/dialog_message.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/subjects.dart';
import 'package:toast/toast.dart';
import 'package:uuid/uuid.dart';

import '../../../../core/bloc_base.dart';
import '../../../difinition.dart';
import '../../../model/local/document/document_table.dart';

class GalleryBloc extends BlocBase {
  GalleryBloc() {
    refreshScreenAndSelectAll();
  }

  BehaviorSubject<List<TDocument>> _documentSingleList =
      BehaviorSubject<List<TDocument>>.seeded(null);

  Stream<List<TDocument>> get documentSingleList => _documentSingleList.stream;

  BehaviorSubject<List<TContainer>> _documentBatchList =
      BehaviorSubject<List<TContainer>>.seeded(null);

  Stream<List<TContainer>> get documentBatchList => _documentBatchList.stream;

  BehaviorSubject<AppState> _screenState =
      BehaviorSubject.seeded(AppState.Idle);

  Stream<AppState> get screenState => _screenState.stream;

  BehaviorSubject<ModeViewDocument> _modeViewDocument =
      BehaviorSubject.seeded(ModeViewDocument.SingleMode);

  Stream<ModeViewDocument> get modeViewDocument => _modeViewDocument.stream;

  BehaviorSubject<bool> _selectionMode = BehaviorSubject.seeded(false);
  Stream<bool> get selectionMode => _selectionMode.stream;

  BehaviorSubject<bool> _isSelectAllDocument = BehaviorSubject.seeded(false);
  Stream<bool> get isSelectAllDocument => _isSelectAllDocument.stream;
  int uploadSuccessCount = 0;
  int uploadFailedCount = 0;

  @override
  void dispose() {
    _screenState?.close();
    _modeViewDocument?.close();
    _selectionMode?.close();
    _documentSingleList?.close();
    _documentBatchList?.close();
    _isSelectAllDocument.close();
  }

  Future<void> getSingleDocumentFromLocal() async {
    _screenState.sink.add(AppState.Loading);
    List<TDocument> _listScanDocument = DocumentDAO.getAll();
    if (_listScanDocument != null) {
      _documentSingleList.sink.add(_listScanDocument);
    }
    _screenState.sink.add(AppState.Idle);
  }

  Future<void> getBatchDocumentFormLocal() async {
    _screenState.sink.add(AppState.Loading);
    List<TContainer> _listScanDocument = ContainerDAO.getAll();
    if (_listScanDocument != null) {
      _documentBatchList.sink.add(_listScanDocument);
    }
    _screenState.sink.add(AppState.Idle);
  }

  void onSwitchModeView(ModeViewDocument modeViewDocument) {
    _modeViewDocument.sink.add(modeViewDocument);
    refreshScreen();
  }

  void changeSelectionMode(bool value) {
    if (value == true) {
      if (_modeViewDocument.value == ModeViewDocument.SingleMode &&
          _documentSingleList?.value != null &&
          _documentSingleList.value.length <= 0) {
        _selectionMode.sink.add(false);
        selectAllDocument(false);
        return;
      }
      if (_modeViewDocument.value == ModeViewDocument.BatchMode &&
          _documentBatchList?.value != null &&
          _documentBatchList.value.length <= 0) {
        _selectionMode.sink.add(false);
        selectAllDocument(false);
        return;
      }
    }
    _selectionMode.sink.add(value);
    selectAllDocument(value);
  }

  void onReviewDocument(BuildContext context, int index) {
    if (_modeViewDocument.value == ModeViewDocument.SingleMode) {
      List<String> listURL = new List();
      listURL.add(_documentSingleList.value[index].imagePath);
      Navigator.of(context)
          .pushNamed(RoutesName.PHOTO_DETAIL, arguments: listURL);
    } else {
      List<String> listURL = new List();
      _documentBatchList.value[index].documents.forEach((element) {
        listURL.add(element.imagePath);
      });
      Navigator.of(context)
          .pushNamed(RoutesName.PHOTO_DETAIL, arguments: listURL);
    }
  }

  onDeleteDocument(BuildContext context) {
    if (isSelectedDocument()) {
      showDialog(
        context: context,
        builder: (context) {
          return DialogMessage(
            title: "Warning",
            message: "Are you sure delete these Document ?",
            onCancelButtonPressed: () {
              Navigator.of(context).pop(false);
            },
            onOKButtonPressed: () {
              Navigator.of(context).pop(true);
            },
          );
        },
      ).then((value) {
        if (value is bool && value) {
          if (_modeViewDocument.value == ModeViewDocument.SingleMode) {
            _documentSingleList.value.forEach((document) {
              if (document.isSelected) {
                File file = File(document.imagePath);
                file.deleteSync();
                DocumentDAO.delete(uuid: document.uuid);
              }
            });
            refreshScreen();
            Toast.show("Delete Successfully !", context);
          } else {
            _documentBatchList.value.forEach((groupDoc) {
              if (groupDoc.isSelected) {
                groupDoc.documents.forEach((document) {
                  File file = File(document.imagePath);
                  file.deleteSync();
                });
                ContainerDAO.delete(groupDoc);
              }
            });
            refreshScreen();
            Toast.show("Delete Successfully !", context);
          }
        }
      });
    } else {
      showMustSelectDocumentDialog(context);
    }
  }

  List<TDocument> getSelectedSingleDoc() {
    return _documentSingleList.value
        .where((element) => element.isSelected)
        .toList();
  }

  List<TContainer> getSelectedBatchDoc() {
    return _documentBatchList.value
        .where((element) => element.isSelected)
        .toList();
  }

  bool isSelectedDocument() {
    if (!_selectionMode.value) {
      return false;
    } else {
      if (_modeViewDocument.value == ModeViewDocument.SingleMode) {
        return getSelectedSingleDoc() != null &&
            getSelectedSingleDoc().length > 0;
      } else {
        return getSelectedBatchDoc() != null &&
            getSelectedBatchDoc().length > 0;
      }
    }
  }

  void onShowDialogSelectDocType(
      {@required BuildContext context, bool isOnlyChangeDefault = false}) {
    if (isSelectedDocument()) {
      showDialog(
          barrierDismissible: false,
          context: context,
          builder: (context) => DialogDocumentType(
                listDocumentTree:
                    CaminadaApplication.instance.documentTreeItemList,
                idDocumentValue: 10,
                onChangeDocType: (DocumentTreeItem documentTreeItem) {
                  if (_modeViewDocument.value == ModeViewDocument.SingleMode) {
                    getSelectedSingleDoc().forEach((element) {
                      if (!isOnlyChangeDefault ||
                          (isOnlyChangeDefault &&
                              element.docTreeId ==
                                  ConstantValues.DEFAULT_ID_DOCUMENT_TREE)) {
                        element.docTreeId =
                            documentTreeItem.data.idDocumentTree;
                        element.docTreeName = documentTreeItem.data.groupName;
                        element.save();
                      }
                    });
                    getSingleDocumentFromLocal();
                  } else {
                    getSelectedBatchDoc().forEach((element) {
                      if (!isOnlyChangeDefault ||
                          (isOnlyChangeDefault &&
                              element.docTreeId ==
                                  ConstantValues.DEFAULT_ID_DOCUMENT_TREE)) {
                        element.docTreeId =
                            documentTreeItem.data.idDocumentTree;
                        element.docTreeName = documentTreeItem.data.groupName;
                        element.documents.forEach((elementDoc) {
                          elementDoc.docTreeId =
                              documentTreeItem.data.idDocumentTree;
                          elementDoc.docTreeName =
                              documentTreeItem.data.groupName;
                          elementDoc.save();
                        });
                        element.save();
                      }
                    });
                    getBatchDocumentFormLocal();
                  }
                },
              ));
    } else {
      showMustSelectDocumentDialog(context);
    }
  }

  void refreshScreen() {
    if (_modeViewDocument.value == ModeViewDocument.SingleMode) {
      getSingleDocumentFromLocal();
    } else {
      getBatchDocumentFormLocal();
    }
    changeSelectionMode(false);
  }

  void refreshScreenAndSelectAll() {
    _modeViewDocument.sink.add(ModeViewDocument.SingleMode);
    getSingleDocumentFromLocal().then((value) {
      changeSelectionMode(true);
    });
  }

  void clearWarning() {
    if (_modeViewDocument.value == ModeViewDocument.SingleMode) {
      _documentSingleList.sink.add(_documentSingleList.value.map((e) {
        e.isUploadFailed = false;
        return e;
      }).toList());
    } else {
      _documentBatchList.sink.add(_documentBatchList.value.map((e) {
        e.isUploadFailed = false;
        return e;
      }).toList());
    }
  }

  void onUploadImage(BuildContext _context) {
    if (isSelectedDocument()) {
      showDialog(
          context: _context,
          builder: (BuildContext context) {
            return DialogMessage(
              message: "Do you want to upload these documents to server?",
              onOKButtonPressed: () {
                Navigator.of(context).pop();

                uploadFailedCount = 0;
                uploadSuccessCount = 0;
                _modeViewDocument.value == ModeViewDocument.SingleMode
                    ? uploadImageSingle(_context)
                    : uploadImageBatch(_context);
              },
              onCancelButtonPressed: () {
                Navigator.of(context).pop();
              },
            );
          });
    } else {
      showMustSelectDocumentDialog(_context);
    }
  }

  Future<void> uploadImageSingle(BuildContext _context) async {
    List<TDocument> listSelectedDoc = getSelectedSingleDoc();
    if (listSelectedDoc.any((element) =>
        element.docTreeId == ConstantValues.DEFAULT_ID_DOCUMENT_TREE)) {
      showDialog(
          context: _context,
          builder: (BuildContext context) {
            return DialogMessage(
              title: 'Warning',
              message:
                  "Can't upload the document have \"${CaminadaApplication.instance.getDocumentTreeNameById(ConstantValues.DEFAULT_ID_DOCUMENT_TREE)}\" !",
              onOKButtonPressed: () {
                Navigator.of(context).pop();
                onShowDialogSelectDocType(
                    context: _context, isOnlyChangeDefault: true);
              },
            );
          });
      return;
    }
    _screenState.sink.add(AppState.Loading);
    String uploadGroupUUID = Uuid().v4();
    for (int i = 0; i < listSelectedDoc.length; i++) {
      TDocument document = listSelectedDoc[i];

      UploadImageRequest uploadImageRequest = new UploadImageRequest();
      var scanningLotItemData =
          initScanningLotItemData(document, uploadGroupUUID);
      var uploadImage = initImageUpLoad([document]);
      uploadImageRequest.images = uploadImage;
      uploadImageRequest.scanningLotItemData = scanningLotItemData;

      UploadImageResponse uploadImageResponse = await appApiService.client
          .uploadImage(uploadImageRequest.toJson())
          .catchError((onError) {});
      if (uploadImageResponse?.item?.result?.isSuccess != null &&
          uploadImageResponse.item.result.isSuccess) {
        uploadSuccessCount++;
        File file = File(document.imagePath);
        file.deleteSync();
        DocumentDAO.delete(uuid: document.uuid);
      } else {
        uploadFailedCount++;
        document.isUploadFailed = true;
      }
    }

    _screenState.sink.add(AppState.Idle);

    showDialogUploadResponse(_context);
  }

  Future<void> uploadImageBatch(BuildContext _context) async {
    List<TContainer> listSelectedContainerDoc = getSelectedBatchDoc();
    if (listSelectedContainerDoc.any((element) =>
        element.docTreeId == ConstantValues.DEFAULT_ID_DOCUMENT_TREE)) {
      showDialog(
          context: _context,
          builder: (BuildContext context) {
            return DialogMessage(
              title: 'Warning',
              message:
                  "Can't upload the document have \"${CaminadaApplication.instance.getDocumentTreeNameById(ConstantValues.DEFAULT_ID_DOCUMENT_TREE)}\" !",
              onOKButtonPressed: () {
                Navigator.of(context).pop();
                onShowDialogSelectDocType(
                    context: _context, isOnlyChangeDefault: true);
              },
            );
          });
      return;
    }
    _screenState.sink.add(AppState.Loading);
    String uploadGroupUUID = Uuid().v4();
    for (int i = 0; i < listSelectedContainerDoc.length; i++) {
      TContainer groupDoc = listSelectedContainerDoc[i];

      UploadImageRequest uploadImageRequest = new UploadImageRequest();

      var scanningLotItemData = initScanningLotItemData(
          groupDoc.documents.first, uploadGroupUUID,
          numberOfImage: groupDoc.documents.length);
      var uploadImage = initImageUpLoad(groupDoc.documents);

      uploadImageRequest.images = uploadImage;
      uploadImageRequest.scanningLotItemData = scanningLotItemData;
      UploadImageResponse uploadImageResponse = await appApiService.client
          .uploadImage(uploadImageRequest.toJson())
          .catchError((onError) {});
      if (uploadImageResponse?.item?.result?.isSuccess != null &&
          uploadImageResponse.item.result.isSuccess) {
        uploadSuccessCount++;
        groupDoc.documents.forEach((element) {
          File file = File(element.imagePath);
          file.deleteSync();
        });
        ContainerDAO.delete(groupDoc);
      } else {
        uploadFailedCount++;
        groupDoc.isUploadFailed = true;
      }
    }

    _screenState.sink.add(AppState.Idle);
    showDialogUploadResponse(_context);
  }

  void showDialogUploadResponse(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Notice!',
            successMessage: uploadSuccessCount.toString() +
                ' documents have been uploaded to server',
            faildMessage: uploadFailedCount > 0
                ? uploadFailedCount.toString() + ' document failed'
                : '',
            onOKButtonPressed: () {
              Navigator.of(context).pop();
            },
          );
        }).then((value) {
      refreshScreen();
    });
  }

  List<ImageUpload> initImageUpLoad(List<TDocument> document) {
    List<ImageUpload> listImage = List();
    int pageNumber = 0;
    document.forEach((element) {
      pageNumber++;
      String imgPath = document.first.imagePath;
      final bytes = File(imgPath).readAsBytesSync();
      String base64String = base64Encode(bytes);
      listImage.add(new ImageUpload(
          fileName: document.first.name,
          pageNr: pageNumber,
          base64String: base64String));
    });
    return listImage;
  }

  ScanningLotItemData initScanningLotItemData(
      TDocument document, String groupUUID,
      {int numberOfImage}) {
    return ScanningLotItemData(
      idDocumentTree: document.docTreeId.toString(),
      idRepScansContainerType: 1,
      idRepScanDeviceType: 2,
      idScansContainer: 0,
      idScansContainerItem: 0,
      customerNr: "1",
      mediaCode: "1",
      scannedDateUtc: document.clientOpenDateUTC,
      coordinatePageNr: 0,
      sourceScanGuid: Uuid().v4(),
      groupUuid: groupUUID,
      numberOfImages: numberOfImage ?? 1,
      lotId: 0,
      isSynced: true,
      isActive: "1",
      isOnlyGamer: "0",
      isUserClicked: true,
    );
  }

  onChangeGroupDocument(BuildContext context) {
    _modeViewDocument.value == ModeViewDocument.SingleMode
        ? onGroupDocument(context)
        : onUnGroupDocument(context);
  }

  onGroupDocument(BuildContext context) async {
    List<TDocument> listSingleSelected = getSelectedSingleDoc();
    if (listSingleSelected.length < 2) {
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return DialogMessage(
              title: 'Information',
              message: 'You must select at least 2 document',
              onOKButtonPressed: () {
                Navigator.of(context).pop();
              },
            );
          });
    } else {
      if (checkTypeDocumentSelected(listSingleSelected)) {
        TContainer groupDoc = TContainer();
        groupDoc.uuid = Uuid().v4();
        groupDoc.docTreeId = listSingleSelected.first.docTreeId;
        groupDoc.docTreeName = listSingleSelected.first.docTreeName;
        await ContainerDAO.insert(groupDoc, listSingleSelected);
        refreshScreen();
      } else {
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return DialogMessage(
                title: 'Information',
                message:
                    'You must select documents in the same document tree to group.',
                onOKButtonPressed: () {
                  Navigator.of(context).pop();
                },
              );
            });
      }
    }
  }

  bool checkTypeDocumentSelected(List<TDocument> listDocument) {
    bool result = true;
    listDocument.forEach((element) {
      if (element.docTreeId != listDocument[0].docTreeId) {
        result = false;
        return;
      }
    });
    return result;
  }

  onUnGroupDocument(BuildContext context) {
    if (isSelectedDocument()) {
      _documentBatchList.value.forEach((groupDoc) {
        if (groupDoc.isSelected) {
          // roupDgoc.documents.forEach((singleDoc) {
          //   DocumentDAO.insert(singleDoc);
          // });
          // ContainerDAO.delete(groupDoc);

          ContainerDAO.unGroupDocument(groupDoc);
        }
      });
      refreshScreen();
    } else {
      showMustSelectDocumentDialog(context);
    }
  }

  void onChangeStatusSelection(int index) {
    _modeViewDocument.value == ModeViewDocument.SingleMode
        ? onChangeStatusSelectSingleDoc(index)
        : onChangeStatusSelectBatchDoc(index);
  }

  void onChangeStatusSelectSingleDoc(int index) {
    _documentSingleList.value[index].isSelected =
        !_documentSingleList.value[index].isSelected;
    _documentSingleList.sink.add(_documentSingleList.value);
    if (getSelectedSingleDoc().length == _documentSingleList.value.length) {
      _isSelectAllDocument.sink.add(true);
    } else {
      _isSelectAllDocument.sink.add(false);
    }
  }

  void onChangeStatusSelectBatchDoc(int index) {
    _documentBatchList.value[index].isSelected =
        !_documentBatchList.value[index].isSelected;
    _documentBatchList.sink.add(_documentBatchList.value);
    if (getSelectedBatchDoc().length == _documentBatchList.value.length) {
      _isSelectAllDocument.sink.add(true);
    } else {
      _isSelectAllDocument.sink.add(false);
    }
  }

  void selectAllDocument(bool value) {
    _modeViewDocument.value == ModeViewDocument.SingleMode
        ? selectAllSingleDocument(value)
        : selectAllBatchDocument(value);
    _isSelectAllDocument.sink.add(value);
  }

  void selectAllSingleDocument(bool isSelected) {
    _documentSingleList.value.forEach((document) {
      document.isSelected = isSelected;
    });
    _documentSingleList.sink.add(_documentSingleList.value);
  }

  void selectAllBatchDocument(bool isSelected) {
    _documentBatchList.value.forEach((document) {
      document.isSelected = isSelected;
    });
    _documentBatchList.sink.add(_documentBatchList.value);
  }

  void showMustSelectDocumentDialog(BuildContext context) {
    showDialog(
        context: context,
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
}

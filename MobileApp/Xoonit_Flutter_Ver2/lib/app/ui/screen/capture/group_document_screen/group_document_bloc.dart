import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/subjects.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/model/remote/group_document/group_document_request.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../../difinition.dart';

class GroupDocumentBloc extends BlocBase {
  final BehaviorSubject<List<DocumentCaptureGroup>> _listDocument =
      BehaviorSubject<List<DocumentCaptureGroup>>.seeded([]);
  Stream<List<DocumentCaptureGroup>> get listDocument => _listDocument.stream;

  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);

  Stream<AppState> get screenState => _screenState.stream;

  final BehaviorSubject<List<int>> _listIdSelected =
      BehaviorSubject<List<int>>.seeded([]);
  Stream<List<int>> get listIdSelected => _listIdSelected.stream;

  List<DocumentDetail> mainDocumentGroup = new List();
  String _idDocumentKeyGroup = "";

  BehaviorSubject<bool> _isLoadMore = BehaviorSubject.seeded(false);
  Stream<bool> get isLoadMore => _isLoadMore.stream;
  int _defaultPageSize = 30;
  int _currentPageIndex = 1;
  int _totalDocumentRecord = 0;

  @override
  void dispose() {
    _listDocument?.close();
    _screenState?.close();
    _listIdSelected?.close();
    _isLoadMore?.close();
  }

  GroupDocumentBloc(String idDocumentKeyGroup) {
    _idDocumentKeyGroup = idDocumentKeyGroup;
    initDocumentToGroup(
        _currentPageIndex, _defaultPageSize, idDocumentKeyGroup);
  }

  void initDocumentToGroup(int currentPageIndex, int defaultPageSize,
      String idDocumentKeyGroup) async {
    _currentPageIndex = currentPageIndex;
    _screenState.sink.add(AppState.Loading);
    List<DocumentCaptureGroup> myListDocument = new List();
    await appApiService.client
        .getAllCaptureThumbnails(_currentPageIndex, defaultPageSize)
        .then((onResponse) {
      if (onResponse != null) {
        _totalDocumentRecord = onResponse.totalRecords;
        List<String> listIdDocument = new List();
        listIdDocument = getListIdDocumentScanContainerWithoutIdDocumentKey(
            onResponse.data, idDocumentKeyGroup);
        listIdDocument.forEach((id) {
          DocumentCaptureGroup documentGroup = new DocumentCaptureGroup();
          List<Capture> listScanImage =
              getListScanDocumentById(id, onResponse.data);
          documentGroup.idDocumentContainer = id;
          documentGroup.numberOfImages = listScanImage.length.toString();
          documentGroup.documentType = listScanImage[0].documentType;
          documentGroup.listDocument = listScanImage;
          myListDocument.add(documentGroup);
        });
      }
    });
    await appApiService.client
        .getDocumentPagesByIdDoc(idDocumentKeyGroup)
        .then((value) {
      if (value != null && value.length > 0) {
        mainDocumentGroup.addAll(value);
      }
    });
    _listDocument.sink.add(myListDocument);
    _screenState.sink.add(AppState.Idle);
  }

  void pullRefeshListDocument(int refreshIndex, int defaultPageSize) {
    initDocumentToGroup(refreshIndex, defaultPageSize, _idDocumentKeyGroup);
  }

  List<Capture> getListScanDocumentById(
      // get list Document on list id.
      String idDocumentScanContainer,
      List<Capture> listData) {
    List<Capture> myList = new List();
    listData.forEach((element) {
      if ((element.idDocumentContainerScans == idDocumentScanContainer)) {
        myList.add(element);
      }
    });
    return myList;
  }

  List<String> getListIdDocumentScanContainerWithoutIdDocumentKey(
      List<Capture> listData, String idDocumentKeyGroup) {
    // the rest of list idDocumentContainerScans without idMainDocument. repair to merge with mainDocument
    List<String> listIdDocument = new List();
    String oldIdDocument = "";
    listData.forEach((document) {
      if (document.idDocumentContainerScans != oldIdDocument &&
          document.idDocumentContainerScans != idDocumentKeyGroup) {
        listIdDocument.add(document.idDocumentContainerScans);
        oldIdDocument = document.idDocumentContainerScans;
      }
    });
    return listIdDocument;
  }

  void changeDocumentSelect(int index, bool value) {
    _listDocument.value.elementAt(index).isSelected = value;
    _listIdSelected.value.contains(index)
        ? _listIdSelected.value.remove(index)
        : _listIdSelected.value.add(index);
    _listIdSelected.sink.add(_listIdSelected.value);
  }

  List<DocumentCaptureGroup> getListDocumentSelected() {
    List<DocumentCaptureGroup> list = new List();
    _listDocument.value.forEach((document) {
      if (document.isSelected) {
        list.add(document);
      }
    });
    return list;
  }

  void reviewImage(
    BuildContext context,
    int index,
  ) {
    GeneralMethod.reviewDocument(
        context, _listDocument.value[index].idDocumentContainer);
  }

  void selectAllDocument(bool value) {
    _listDocument.value.forEach((document) {
      document.isSelected = value;
    });
    _listDocument.sink.add(_listDocument.value);
  }

  void groupDocument(BuildContext context) async {
    List<DocumentCaptureGroup> listItemSelected = getListDocumentSelected();
    List<GroupDocumentRequestItem> listRequest = new List();
    int pageNr = 0;
    if (listItemSelected.length == 0) {
      showDialog(
          context: context,
          builder: (_context) {
            return NotificationDialog(
                iconImages: Image.asset(Resources.icDialogWarning),
                title: "Notice !",
                message: "You must select \n at least one document !",
                possitiveButtonName: "OK",
                possitiveButtonOnClick: (_) {
                  Navigator.of(_context).pop();
                });
          });
    } else {
      try {
        _screenState.sink.add(AppState.Loading);
        listRequest = initMainDocumentRequest(pageNr);
        pageNr = mainDocumentGroup.length;
        for (int i = 0; i < listItemSelected.length; i++) {
          List<DocumentDetail> documentDetails = await appApiService.client
              .getDocumentPagesByIdDoc(listItemSelected[i].idDocumentContainer);

          if (documentDetails != null && documentDetails.length > 0) {
            documentDetails.forEach((element) {
              pageNr++;
              listRequest.add(new GroupDocumentRequestItem(
                idMainDocument: null,
                indexName: '',
                pageNr: pageNr,
                idDocumentContainerScans:
                    int.parse(mainDocumentGroup.first.idDocumentContainerScans),
                oldFileName: element.fileName,
                oldScannedPath: element.scannedPath,
                oldIdDocumentContainerScans: element.idDocumentContainerScans,
                idDocumentContainerOcr: element.idDocumentContainerOcr,
                scannedPath: mainDocumentGroup.first.scannedPath,
              ));
            });
          }
        }

        await sendRequestGroupDocument(listRequest).then((value) {
          if (value is bool && value == true) {
            showDialog(
                context: context,
                builder: (_context) {
                  return NotificationDialog(
                      iconImages: Image.asset(Resources.icDialogWarning),
                      title: "Success !",
                      message: "Group document successfully !",
                      possitiveButtonName: "OK",
                      possitiveButtonOnClick: (_) {
                        Navigator.of(_context).pop(true);
                      });
                }).then((value) => Navigator.of(context).pop(true));
          } else {
            showDialog(
                context: context,
                builder: (_context) {
                  return NotificationDialog(
                      iconImages: Image.asset(Resources.icDialogWarning),
                      title: "Notice !",
                      message: "Group document failed !",
                      possitiveButtonName: "OK",
                      possitiveButtonOnClick: (_) {
                        Navigator.of(_context).pop(true);
                      });
                });
          }
        });
        _screenState.sink.add(AppState.Idle);
      } catch (e) {
        printLog(e);
        _screenState.sink.add(AppState.Idle);
      }
    }
  }

  Future<bool> sendRequestGroupDocument(
      List<GroupDocumentRequestItem> listRequest) async {
    bool isGroupDocumentSuccess = false;
    await appApiService.client
        .groupDocumentPages(groupDocumentRqToJson(listRequest))
        .then((response) {
      if (response != null && response.isSuccess) {
        isGroupDocumentSuccess = true;
      } else {
        isGroupDocumentSuccess = false;
      }
    }).catchError((e) {
      isGroupDocumentSuccess = false;
    });
    return isGroupDocumentSuccess;
  }

  List<GroupDocumentRequestItem> initMainDocumentRequest(int pageNr) {
    List<GroupDocumentRequestItem> listRequest = new List();
    mainDocumentGroup.forEach((doc) {
      pageNr++;
      listRequest.add(new GroupDocumentRequestItem(
        idMainDocument: null,
        indexName: '',
        pageNr: pageNr,
        idDocumentContainerOcr: doc.idDocumentContainerOcr,
        idDocumentContainerScans:
            int.parse(mainDocumentGroup.first.idDocumentContainerScans),
        oldFileName: doc.fileName,
        oldScannedPath: doc.scannedPath,
        oldIdDocumentContainerScans: doc.idDocumentContainerScans,
        scannedPath: mainDocumentGroup.first.scannedPath,
      ));
    });
    return listRequest;
  }

  List<Map<String, dynamic>> groupDocumentRqToJson(
      List<GroupDocumentRequestItem> request) {
    List<Map<String, dynamic>> list = new List();
    request.forEach((element) {
      list.add(element.toJson());
    });
    return list;
  }

  void loadMoredocument() async {
    if ((_currentPageIndex + 1) > maxPage()) {
      return;
    }
    _isLoadMore.sink.add(true);
    _currentPageIndex = _currentPageIndex + 1;
    List<DocumentCaptureGroup> myListDocument = new List();
    await appApiService.client
        .getAllCaptureThumbnails(_currentPageIndex, _defaultPageSize)
        .then((response) {
      if (response != null && response.data.length > 0) {
        List<String> listIdDocument = new List();
        listIdDocument = getListIdDocumentScanContainerWithoutIdDocumentKey(
            response.data, _idDocumentKeyGroup);
        listIdDocument.forEach((id) {
          DocumentCaptureGroup documentGroup = new DocumentCaptureGroup();
          List<Capture> listScanImage =
              getListScanDocumentById(id, response.data);
          documentGroup.idDocumentContainer = id;
          documentGroup.numberOfImages = listScanImage.length.toString();
          documentGroup.documentType = listScanImage[0].documentType;
          documentGroup.listDocument = listScanImage;
          documentGroup.isSelected = false;
          myListDocument.add(documentGroup);
        });
        _listDocument.value.addAll(myListDocument);
        _listDocument.sink.add(_listDocument.value);
      }
      _isLoadMore.sink.add(false);
    }).catchError((onError) {
      _isLoadMore.sink.add(false);
    });
  }

  int maxPage() {
    int pageCount = (_totalDocumentRecord ~/ _defaultPageSize);
    return _totalDocumentRecord % _defaultPageSize > 0
        ? (pageCount + 1)
        : pageCount;
  }
}

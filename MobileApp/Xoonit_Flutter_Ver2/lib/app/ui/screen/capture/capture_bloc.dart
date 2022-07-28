import 'dart:async';

import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/core/bloc_base.dart';

class CaptureBloc extends BlocBase {
  final BehaviorSubject<List<DocumentCaptureGroup>> _captureList =
      BehaviorSubject<List<DocumentCaptureGroup>>.seeded(null);

  Stream<List<DocumentCaptureGroup>> get captureList => _captureList.stream;

  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);

  Stream<AppState> get screenState => _screenState.stream;

  BehaviorSubject<bool> _isLoadMore = BehaviorSubject.seeded(false);
  Stream<bool> get isLoadMore => _isLoadMore.stream;

  BehaviorSubject<int> _totalFile = BehaviorSubject.seeded(0);
  Stream<int> get totalFile => _totalFile.stream;

  int _defaultPageSize = 20;
  int _currentPageIndex = 1;
  int _totalDocumentRecord = 0;

  @override
  void dispose() {
    closeStream();
  }

  CaptureBloc() {
    getCapture(_currentPageIndex, _defaultPageSize);
  }

  void closeStream() {
    _captureList?.close();
    _screenState?.close();
    _isLoadMore?.close();
    _totalFile?.close();
  }

  getCapture(int currentPageIndex, int defaultPageSize) async {
    _currentPageIndex = currentPageIndex;
    _screenState.sink.add(AppState.Loading);
    List<DocumentCaptureGroup> myListDocument = new List();
    await appApiService.client
        .getAllCaptureThumbnails(currentPageIndex, defaultPageSize)
        .then((onValue) {
      if (onValue != null) {
        _totalDocumentRecord = onValue.totalRecords;
        _totalFile.sink.add(onValue.totalRecords);
        List<String> listIdDocument = new List();
        listIdDocument = getListIdDocumentScanContainer(onValue.data);
        listIdDocument.forEach((id) {
          DocumentCaptureGroup documentGroup = new DocumentCaptureGroup();
          List<Capture> listScanImage =
              getListScanDocumentById(id, onValue.data);
          documentGroup.idDocumentContainer = id;
          documentGroup.numberOfImages = listScanImage.length.toString();
          documentGroup.documentType = listScanImage[0].documentType;
          documentGroup.listDocument = listScanImage;
          documentGroup.isSelected = false;
          myListDocument.add(documentGroup);
        });
        _captureList.sink.add(myListDocument);
      } else {
        _captureList.sink.add([]);
        _totalFile.sink.add(0);
      }
    }).catchError((onError) {
      _captureList.sink.add([]);
      _totalFile.sink.add(0);
    });
    _screenState.sink.add(AppState.Idle);
  }

  reviewCapture(BuildContext context, int index, DashBoardBloc dashBoardBloc) {
    dashBoardBloc
        .jumpToScreen(EHomeScreenChild.reviewCapture,
            args: _captureList.value[index].idDocumentContainer)
        .then((value) {
      if (value is bool && value == true) {
        getCapture(1, _defaultPageSize);
      }
    });
  }

  changeDocumentStatus(int index) {
    DocumentCaptureGroup document = _captureList.value[index];
    document.isSelected = !document.isSelected;
    _captureList.sink.add(_captureList.value);
  }

  void onDeleteCapture(BuildContext context, String idDocumentContainerScan) {
    showDialog(
      context: context,
      builder: (mContext) {
        return NotificationDialog(
          iconImages: Image.asset(Resources.icDialogWarning),
          title: "Notice !",
          possitiveButtonName: "Ok",
          possitiveButtonOnClick: (_) {
            Navigator.of(mContext).pop(true);
          },
          message: "Are you sure delete this document ?",
          negativeButtonName: "Cancel",
          nagativeButtonOnCLick: (_) {
            Navigator.of(mContext).pop();
          },
          body: SizedBox.shrink(),
        );
      },
    ).then((value) {
      if (value != null && value) {
        deleteCapture(context, idDocumentContainerScan).then((value) {
          _screenState.sink.add(AppState.Idle);
          if (value) {
            showDialog(
              context: context,
              builder: (_context) {
                return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Notice !",
                  possitiveButtonName: "Ok",
                  possitiveButtonOnClick: (_) {
                    Navigator.of(context).pop();
                  },
                  body: SizedBox.shrink(),
                  message: "Delete document successfully !",
                );
              },
            ).then((value) {
              getCapture(_currentPageIndex, _defaultPageSize);
            });
          } else {
            showDialog(
              context: context,
              builder: (_context) {
                return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Notice !",
                  possitiveButtonName: "Ok",
                  possitiveButtonOnClick: (_) {
                    Navigator.of(context).pop();
                  },
                  body: SizedBox.shrink(),
                  message: "Delete document failed !",
                );
              },
            );
          }
        });
      }
    });
  }

  Future<bool> deleteCapture(
      BuildContext context, String idDocumentContainerScan) async {
    _screenState.sink.add(AppState.Loading);
    List<String> listId = new List();
    listId.add(idDocumentContainerScan);
    var value = await appApiService.client
        .deleteScanDocument(onDeleteRequestToJson(listId));

    return (value != null && value.length > 0);
  }

  setDocumentSelectedChangesStatus(int index, value) {
    DocumentCaptureGroup document = _captureList.value[index];
    document.isSelected = !value;
    _captureList.sink.add(_captureList.value);
  }

  List<Capture> getListScanDocumentById(
      String idDocumentScanContainer, List<Capture> listData) {
    List<Capture> myList = new List();
    listData.forEach((element) {
      if ((element.idDocumentContainerScans == idDocumentScanContainer)) {
        myList.add(element);
      }
    });
    return myList;
  }

  List<String> getListIdDocumentScanContainer(List<Capture> listData) {
    List<String> listIdDocument = new List();
    String oldIdDocument = "";
    listData.forEach((document) {
      if (document.idDocumentContainerScans != oldIdDocument) {
        listIdDocument.add(document.idDocumentContainerScans);
        oldIdDocument = document.idDocumentContainerScans;
      }
    });
    return listIdDocument;
  }

  Map<String, dynamic> onDeleteRequestToJson(
          List<String> idDocumentContainerScan) =>
      {
        "DocumentContainerScanIds":
            List<String>.from(idDocumentContainerScan.map((e) => e)),
      };

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
        listIdDocument = getListIdDocumentScanContainer(response.data);
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
        _captureList.value.addAll(myListDocument);
        _captureList.sink.add(_captureList.value);
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

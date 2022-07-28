import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/core/bloc_base.dart';

class CaptureBloc extends BlocBase {
  final BehaviorSubject<List<DocumentCaptureGroup>> _captureList =
      BehaviorSubject<List<DocumentCaptureGroup>>.seeded(null);

  Stream<List<DocumentCaptureGroup>> get captureList => _captureList.stream;

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

  CaptureBloc() {
    getAllCapture();
  }

  void closeStream() {
    _captureList?.close();
    _selectedMode?.close();
    _screenState?.close();
  }

  getAllCapture() async {
    _screenState.sink.add(AppState.Loading);
    List<DocumentCaptureGroup> myListDocument = new List();
    await appApiService.client.getAllCaptureThumbnails().then((onValue) {
      if (onValue != null && onValue.length > 0) {
        List<String> listIdDocument = new List();
        listIdDocument = getListIdDocumentScanContainer(onValue);
        listIdDocument.forEach((id) {
          DocumentCaptureGroup documentGroup = new DocumentCaptureGroup();
          List<CaptureResponse> listScanImage =
              getListScanDocumentById(id, onValue);
          documentGroup.idDocumentContainer = id;
          documentGroup.numberOfImages = listScanImage.length.toString();
          documentGroup.documentType = listScanImage[0].documentType;
          documentGroup.listDocumentCapture = listScanImage;
          documentGroup.isSelected = false;
          myListDocument.add(documentGroup);
        });
        _captureList.sink.add(myListDocument);
        _selectedMode.sink.add(false);
      }
    });
    _screenState.sink.add(AppState.Idle);
  }

  void setSelectedMode(bool value) {
    _captureList.value.forEach((document) {
      document.isSelected = false;
    });
    _selectedMode.sink.add(value);
  }

  reviewCapture(BuildContext context, int index) {
    DocumentCaptureGroup document = _captureList.value[index];
    AppMaster.navigatorKey.currentState
        .pushNamed(RoutesName.REVIEW_DOCUMENT_CAPTURE, arguments: document);
  }

  changeDocumentStatus(int index) {
    DocumentCaptureGroup document = _captureList.value[index];
    document.isSelected = !document.isSelected;
    _captureList.sink.add(_captureList.value);
  }

  void onDeleteCapture(BuildContext context, String idDocumentContainerScan) {
    showDialog(
      context: context,
      builder: (context) {
        return DialogMessage(
          title: "Delete Document",
          message: "Are you sure delete this document ?",
          onOKButtonPressed: () {
            Navigator.of(context).pop(true);
          },
          onCancelButtonPressed: () {
            Navigator.of(context).pop();
          },
        );
      },
    ).then((value) {
      if (value != null && value) {
        deleteCapture(context, idDocumentContainerScan).then((value) {
          _screenState.sink.add(AppState.Idle);
          if (value) {
            showDialog(
              context: context,
              builder: (context) {
                return DialogMessage(
                  title: "Notification",
                  message: "Delete document successfully !",
                  onOKButtonPressed: () {
                    Navigator.of(context).pop();
                  },
                );
              },
            ).then((value) {
              getAllCapture();
            });
          } else {
            showDialog(
              context: context,
              builder: (context) {
                return DialogMessage(
                  title: "Notification",
                  message: "Delete document failed !",
                  onOKButtonPressed: () {
                    Navigator.of(context).pop();
                  },
                );
              },
            );
          }
        });
      }
    });
  }

  void callDeleteCaptureAPI() {}
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

  List<CaptureResponse> getListScanDocumentById(
      String idDocumentScanContainer, List<CaptureResponse> listData) {
    List<CaptureResponse> myList = new List();
    listData.forEach((element) {
      if ((element.idDocumentContainerScans == idDocumentScanContainer)) {
        myList.add(element);
      }
    });
    return myList;
  }

  List<String> getListIdDocumentScanContainer(List<CaptureResponse> listData) {
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
}

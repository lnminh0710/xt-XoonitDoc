import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:rxdart/subjects.dart';
import 'package:toast/toast.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/model/remote/capture/save_document/document_contracts.dart';
import 'package:xoonit/app/model/remote/capture/save_document/document_invoices.dart';
import 'package:xoonit/app/model/remote/capture/save_document/document_tree_media.dart';
import 'package:xoonit/app/model/remote/capture/save_document/main_document.dart';
import 'package:xoonit/app/model/remote/capture/save_document/other_documents.dart';
import 'package:xoonit/app/model/remote/capture/save_document/save_document_request.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/model/remote/rotate_document_request.dart';
import 'package:xoonit/app/model/remote/share_document_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/component/compose_mail_component.dart';
import 'package:xoonit/app/ui/dialog/assign_document_popup.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../dialog/dialog_review_image.dart';

class ReviewDocumentBloc extends BlocBase {
  BehaviorSubject<AppState> _screenState =
      BehaviorSubject.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  DocumentTreeItem _documentTreeItem;

  BehaviorSubject<List<DocumentDetail>> _documents = BehaviorSubject.seeded([]);
  Stream<List<DocumentDetail>> get documents => _documents.stream;

  // BehaviorSubject<bool> _isShowFieldNotes = BehaviorSubject.seeded(false);
  // Stream<bool> get isShowFieldNotes => _isShowFieldNotes.stream;

  BehaviorSubject<bool> _isShowPopUpAssignDocument =
      BehaviorSubject.seeded(true);
  Stream<bool> get isShowPopUpAssignDocument =>
      _isShowPopUpAssignDocument.stream;

  BehaviorSubject<int> _currentIndex = BehaviorSubject.seeded(0);
  Stream<int> get currentIndex => _currentIndex.stream;
  BehaviorSubject<String> _documentFolderPath = BehaviorSubject.seeded("");
  Stream<String> get documentFolderPath => _documentFolderPath.stream;

  String _idDocumentContainerScans = "";
  String _idDocumentContainerOCR = "";
  String _searchKeyWords = "";
  String _notes = "";
  bool isSaveTodo = false;

  @override
  void dispose() {
    _screenState?.close();
    _documents?.close();
    // _isShowFieldNotes?.close();
    _isShowPopUpAssignDocument?.close();
    _currentIndex?.close();
    _documentFolderPath.close();
  }

  ReviewDocumentBloc(String idDocumentContainerScans) {
    initDocumentPreview(idDocumentContainerScans);
  }

  void initDocumentPreview(String idDocumentContainerScans) async {
    _screenState.sink.add(AppState.Loading);
    await appApiService.client
        .getDocumentPagesByIdDoc(idDocumentContainerScans)
        .then((value) {
      if (value != null && value.length > 0) {
        _documents.sink.add(value);
        _idDocumentContainerOCR = value.first.idDocumentContainerOcr;
        _idDocumentContainerScans = idDocumentContainerScans;
      } else {
        _documents.sink.add([]);
      }
    }).catchError((onError) {
      _documents.sink.add([]);
    });
    _screenState.sink.add(AppState.Idle);
  }

  void closePopUpAssignDocument() {
    _isShowPopUpAssignDocument.sink.add(false);
  }

  void saveTextNotesKeywords(bool isSaveNotes, String value) {
    isSaveNotes ? _notes = value : _searchKeyWords = value;
  }

  void changeCurrentIndexViewCapture(int index) {
    _currentIndex.sink.add(index);
  }

  void onShowDialogComposeMail(BuildContext context) {
    showDialog(context: context, builder: (context) => ShowPopUpComposeMail())
        .then((value) {
      if (value != null && value.runtimeType == ContentMail) {
        ContentMail content = value;
        onShareDocumentToMail(context, content.mail, content.subjects,
            content.content, _idDocumentContainerScans);
      }
    });
  }

  void onShareDocumentToMail(BuildContext context, String mail, String subject,
      String contentBody, String idDocumentContainerScan) async {
    _screenState.sink.add(AppState.Loading);
    ShareDocumentRequest request = new ShareDocumentRequest(
        body: contentBody,
        idDocumentContainerScans: idDocumentContainerScan,
        subject: subject,
        toEmail: mail);
    appApiService.client.shareDocumentToMail(request.toJson()).then((value) => {
          _screenState.sink.add(AppState.Idle),
          showDialog(
            context: context,
            builder: (context) {
              if (value != null && value == true) {
                return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Notice !",
                  possitiveButtonName: "OK",
                  possitiveButtonOnClick: (_) {
                    Navigator.of(context).pop();
                  },
                  message: "Share document Successfully !",
                  body: SizedBox.shrink(),
                );
              } else {
                return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Notice !",
                  possitiveButtonName: "OK",
                  possitiveButtonOnClick: (_) {
                    Navigator.of(context).pop();
                  },
                  message: "Share document failed !",
                  body: SizedBox.shrink(),
                );
              }
            },
          )
        });
  }

  void downloadFile(BuildContext context) async {
    try {
      _screenState.sink.add(AppState.Loading);
      String url = GeneralMethod.getDownloadURL(_idDocumentContainerScans);
      String documentName = _documents.value[_currentIndex.value].fileName;
      if (Platform.isAndroid) {
        var dirPath = await getExternalStorageDirectories(
            type: StorageDirectory.downloads);
        String savePath = dirPath.first.path + "/$documentName.pdf";
        await Dio().download(
          url,
          savePath,
          onReceiveProgress: (received, total) {
            if (total != -1) {
              printLog((received / total * 100).toStringAsFixed(0) + "%");
            }
          },
        ).then((value) {
          if (value.statusCode == 200) {
            showDownloadFileSuccessDialog(
                context, dirPath.first.path, documentName);
          } else {
            showDownloadFailedDialog(context);
          }
        }).catchError(() {
          showDownloadFailedDialog(context);
        });
      } else {
        Directory dir = await getApplicationSupportDirectory();
        await Dio().download(
          url,
          dir.path + "/$documentName.pdf",
          onReceiveProgress: (received, total) {
            if (total != -1) {
              printLog((received / total * 100).toStringAsFixed(0) + "%");
            }
          },
        ).then((value) {
          if (value.statusCode == 200) {
            showDownloadFileSuccessDialog(context, dir.path, documentName);
          } else {
            showDownloadFailedDialog(context);
          }
        }).catchError(() {
          showDownloadFailedDialog(context);
        });
      }
      _screenState.sink.add(AppState.Idle);
    } catch (e) {
      printLog(e);
      _screenState.sink.add(AppState.Idle);
    }
  }

  void showDownloadFileSuccessDialog(
      BuildContext context, String dirPath, String fileName) {
    showDialog(
        context: context,
        builder: (BuildContext _context) {
          return NotificationDialog(
            iconImages: Image.asset(Resources.icDialogDownload),
            title: "Download",
            message: "Download file successfully!",
            possitiveButtonName: "View file",
            possitiveButtonOnClick: (_) {
              Navigator.of(_context).pop();
              viewFileDownloaded(context, dirPath, fileName);
            },
            negativeButtonName: "Cancel",
            nagativeButtonOnCLick: (_) {
              Navigator.of(_context).pop();
            },
          );
        });
  }

  void showDownloadFailedDialog(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Notice!',
            message: 'Download failed , please check again !',
            onOKButtonPressed: () {
              Navigator.of(context).pop();
            },
          );
        });
  }

  // Future<void> openFolderDownloadFile(
  //     BuildContext context, String dirPath) async {
  //   Directory directory = Directory(dirPath);
  //   var list = directory.listSync();
  //   await OpenFile.open(list.first.path);
  // }

  Future<void> viewFileDownloaded(
      BuildContext context, String filePath, String fileName) async {
    String path = filePath + "/" + fileName + ".pdf";
    await OpenFile.open(path);
  }

  printDocument(BuildContext context) async {
    try {
      String url = GeneralMethod.getDownloadURL(_idDocumentContainerScans);
      Directory savePath;
      String documentName = _documents.value[_currentIndex.value].fileName;
      if (Platform.isAndroid) {
        var savePathDir = await getExternalStorageDirectories(
            type: StorageDirectory.downloads);
        savePath = savePathDir.first;
      } else {
        savePath = await getApplicationSupportDirectory();
      }

      String localPathURL = savePath.path + "/Print/$documentName.pdf";
      await Dio().download(url, localPathURL);
      printLog(localPathURL);

      File file = File(localPathURL);
      await Printing.layoutPdf(onLayout: (PdfPageFormat format) {
        return file.readAsBytesSync();
      }).then((value) {
        if (value) {
          Toast.show("Printing...", context,
              gravity: Toast.BOTTOM, duration: Toast.LENGTH_LONG);
        }
      });
    } catch (e) {
      printLog(e);
    }
  }

  void showDialogRotateDocument(
      BuildContext context, String documentName, String documentURL) {
    showDialog(
        context: context,
        builder: (BuildContext mContext) {
          return ReviewImageDialog(
            isLocalImage: false,
            listDocumentName: [documentName],
            listDocumentURL: [documentURL],
            isEditableDocument: true,
            saveEditImage: (int degrees) {
              rotateImage(
                mContext,
                int.parse(_idDocumentContainerScans),
                int.parse(_idDocumentContainerOCR),
                degrees,
              ).then((value) {
                if (value is bool && value == true) {
                  showDialog(
                      context: context,
                      builder: (BuildContext _context) {
                        return NotificationDialog(
                          iconImages: Image.asset(Resources.icDialogWarning),
                          title: "Notice !",
                          possitiveButtonName: "OK",
                          possitiveButtonOnClick: (_) {
                            initDocumentPreview(_idDocumentContainerScans);
                            Navigator.of(_context).pop(true);
                          },
                          message: "Rotate successfully !",
                          body: SizedBox.shrink(),
                        );
                      });
                } else {
                  showDialog(
                      context: context,
                      builder: (BuildContext _context) {
                        return NotificationDialog(
                          iconImages: Image.asset(Resources.icDialogWarning),
                          title: "Notice !",
                          possitiveButtonName: "OK",
                          possitiveButtonOnClick: (_) {
                            Navigator.of(_context).pop();
                          },
                          message: "Rotate failed !",
                          body: SizedBox.shrink(),
                        );
                      });
                }
              });
            },
          );
        });
  }

  Future<bool> rotateImage(BuildContext context, int idDocumentContainerScans,
      int idDocumentContainerOCR, int degrees) async {
    bool isRotationSuccess = false;
    _screenState.sink.add(AppState.Loading);
    RotateDocument ocrDoc = RotateDocument(
      idDocumentContainerScans: idDocumentContainerScans,
      ocrId: idDocumentContainerOCR,
      idMainDocument: null,
      indexName: '',
      rotate: degrees,
    );
    RotateDocumentRequest request = RotateDocumentRequest(ocrDocs: [ocrDoc]);
    await appApiService.client.requestOCR(request.toJson()).then((value) {
      if (value != null && value.contains("DONE")) {
        isRotationSuccess = true;
      }
    }).catchError((onError) {
      printLog(onError);
      isRotationSuccess = false;
    });
    _screenState.sink.add(AppState.Idle);
    return isRotationSuccess;
  }

  void deleteDocument(BuildContext context) {
    showDialog(
        context: context,
        builder: (_context) {
          return NotificationDialog(
            iconImages: Image.asset(Resources.icDialogWarning),
            title: "Notice !",
            possitiveButtonName: "OK",
            possitiveButtonOnClick: (_) {
              Navigator.of(_context).pop(true);
            },
            message: "Are you sure delete this document ?",
            negativeButtonName: "Cancel",
            nagativeButtonOnCLick: (_) {
              Navigator.of(_context).pop(false);
            },
            body: SizedBox.shrink(),
          );
        }).then((value) {
      if (value is bool && value == true) {
        _screenState.sink.add(AppState.Loading);
        appApiService.client
            .deleteScanDocument(
                onDeleteRequestToJson([_idDocumentContainerScans]))
            .then((response) {
          _screenState.sink.add(AppState.Idle);
          if (response[0].statusDeleteOnDb) {
            showDialog(
                context: context,
                builder: (BuildContext c) {
                  return NotificationDialog(
                    iconImages: Image.asset(Resources.icDialogWarning),
                    title: "Information",
                    message: "Delete document success !",
                    possitiveButtonName: "OK",
                    possitiveButtonOnClick: (_) {
                      Navigator.of(c).pop(true);
                    },
                    body: SizedBox.shrink(),
                  );
                }).then((value) => Navigator.of(context).pop(true));
          } else {
            showDeleteDialog(context,
                isDownloadSuccess: false,
                message: "Delete document failed !",
                title: "Notice !");
          }
        }).catchError((onError) {
          showDeleteDialog(context,
              isDownloadSuccess: false,
              message: "Delete document failed !",
              title: "Notice !");
        });
      }
    });
  }

  void showDeleteDialog(BuildContext context,
      {String title, String message, bool isDownloadSuccess}) {
    showDialog(
        context: context,
        builder: (BuildContext _context) {
          return NotificationDialog(
            iconImages: Image.asset(Resources.icDialogWarning),
            title: title ?? "",
            message: message ?? "",
            possitiveButtonName: "OK",
            possitiveButtonOnClick: (_) {
              Navigator.of(_context).pop(isDownloadSuccess);
            },
            body: SizedBox.shrink(),
          );
        });
  }

  Map<String, dynamic> onDeleteRequestToJson(
          List<String> idDocumentContainerScan) =>
      {
        "DocumentContainerScanIds":
            List<String>.from(idDocumentContainerScan.map((e) => e)),
      };
  Future<bool> openGroupDocumentScreen(BuildContext context) async {
    bool isDocumentChanged = false;
    await AppMaster.globalNavigatorKey.currentState
        .pushNamed(RoutesName.GROUP_CAPTURE,
            arguments: _idDocumentContainerScans)
        .then((value) {
      if (value is bool && value == true) {
        initDocumentPreview(_idDocumentContainerScans);
        isDocumentChanged = true;
      }
    });
    return isDocumentChanged;
  }

  void selectedFolder(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext mContext) {
          return SelectDocumentTreeDialog(
            titleDialog: "Choose folder to assign ",
            folderSelected: _documentTreeItem,
          );
        }).then((value) {
      if (value is DocumentTreeItem &&
          value != null &&
          value?.data?.idDocumentTree != null) {
        _documentTreeItem = value;
        assignDocumenToFolder();
        closePopUpAssignDocument();
      }
    });
  }

  void assignDocumenToFolder() {
    switch (_documentTreeItem.data.idRepDocumentGuiType) {
      case 1:
        _documentTreeItem.folderDocument = FolderDocument.Invoice;
        break;
      case 2:
        _documentTreeItem.folderDocument = FolderDocument.Contract;
        break;
      default:
        _documentTreeItem.folderDocument = FolderDocument.Other;
    }
    _documentFolderPath.sink.add(_documentTreeItem.data.folderPath);
  }

  void saveDocument(BuildContext context, DashBoardBloc dashBoardBloc) async {
    _screenState.sink.add(AppState.Loading);
    if (_documentTreeItem?.folderDocument != null) {
      var response;
      switch (_documentTreeItem.folderDocument) {
        case FolderDocument.Invoice:
          response = await _saveInvoice();
          break;
        case FolderDocument.Contract:
          response = await _saveContract();
          break;
        default:
          response = await _saveOtherDocument(context);
          break;
      }
      if (response != null && response is bool && response == true) {
        showDialog(
            context: context,
            builder: (c) {
              return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Notice !",
                  message: "Save document success !",
                  possitiveButtonName: "OK",
                  possitiveButtonOnClick: (_) {
                    Navigator.of(c).pop(true);
                  });
            }).then((value) => dashBoardBloc.goBack(args: true));
      } else {
        showDialog(
            context: context,
            builder: (c) {
              return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Notice !",
                  message: "Save document failed !",
                  possitiveButtonName: "OK",
                  possitiveButtonOnClick: (_) {
                    Navigator.of(c).pop();
                  });
            });
      }
    } else {
      showDialog(
          context: context,
          builder: (c) {
            return NotificationDialog(
                iconImages: Image.asset(Resources.icDialogWarning),
                title: "Notice !",
                message: "You must assign document to folder",
                possitiveButtonName: "OK",
                possitiveButtonOnClick: (_) {
                  Navigator.of(c).pop();
                });
          });
    }
    _screenState.sink.add(AppState.Idle);
  }

  Future<bool> _saveInvoice() async {
    bool isSuccess = false;
    SaveDocumentRequest request = new SaveDocumentRequest(
        folderChange: null,
        personBeneficiary: null,
        mainDocument: initMainDocument(),
        documentTreeMedia: initDocumentTreeMedia(),
        invoice: initInvoiceDocument());
    await appApiService.client
        .saveDocumentInvoices(request.toJson())
        .then((response) {
      if (response != null && response.item.isSuccess == true) {
        isSuccess = true;
      }
    }).catchError((onError) {
      isSuccess = false;
    });
    return isSuccess;
  }

  Future<bool> _saveContract() async {
    bool isSuccess = false;
    SaveDocumentRequest request = new SaveDocumentRequest(
      folderChange: null,
      mainDocument: initMainDocument(),
      documentTreeMedia: initDocumentTreeMedia(),
      contract: initContractDocument(),
      personContractingParty: null,
      dynamicFields: null,
    );
    await appApiService.client
        .saveDocumentContracts(request.toJson())
        .then((response) {
      if (response != null && response.item.isSuccess == true) {
        isSuccess = true;
      }
    }).catchError((onError) {
      isSuccess = false;
    });
    return isSuccess;
  }

  Future<bool> _saveOtherDocument(BuildContext context) async {
    bool isSuccess = false;
    SaveDocumentRequest request = new SaveDocumentRequest(
      folderChange: null,
      dynamicFields: null,
      mainDocument: initMainDocument(),
      documentTreeMedia: initDocumentTreeMedia(),
      personContact: null,
      otherDocuments: OtherDocuments(
          idDocumentTree: _documentTreeItem.data.idDocumentTree.toString(),
          idDocumentContainerScans: _idDocumentContainerScans),
    );
    await appApiService.client
        .saveOtherDocument(request.toJson())
        .then((response) {
      if (response != null && response.item.isSuccess == true) {
        isSuccess = true;
      }
    }).catchError((onError) {
      isSuccess = false;
    });
    return isSuccess;
  }

  DocumentTreeMedia initDocumentTreeMedia() {
    return new DocumentTreeMedia(
        cloudMediaPath: _documentTreeItem.data.folderPath,
        idDocumentTree: _documentTreeItem.data.idDocumentTree.toString(),
        idDocumentTreeMedia: null,
        idRepTreeMediaType:
            _documentTreeItem.folderDocument.idRepTreeMediaType.toString(),
        mediaName: _documents.value.first.fileName);
  }

  MainDocument initMainDocument() {
    return new MainDocument(
      idMainDocument: null,
      idDocumentContainerScans: _idDocumentContainerScans,
      searchKeyWords: _searchKeyWords,
      notes: _notes,
      isTodo: isSaveTodo ? "1" : "0",
      mainDocumentTree: new MainDocumentTree(
          idDocumentTree: _documentTreeItem.data.idDocumentTree.toString(),
          newFolder: null,
          oldFolder: null),
    );
  }

  Invoice initInvoiceDocument() {
    return new Invoice(
      customerNr: null,
      invoiceNr: null,
      invoiceDate: null,
      payableWithinDays: null,
      idRepMeansOfPayment: null,
      purposeOfPayment: null,
      idRepCurrencyCode: "",
      invoiceAmount: "0",
      isPaid: "0",
      isTaxRelevant: "0",
      isGuarantee: "0",
      guaranteeDateOfExpiry: null,
      vatNr: null,
      iban: null,
      swiftbic: null,
      contoNr: null,
      invoiceExpirydDate: null,
      guranteeExpiryDate: null,
      notes: null,
      eSrNr: null,
    );
  }

  Contract initContractDocument() {
    return new Contract(
        idContract: null,
        contractNr: "",
        netAnnualPremium: null,
        idRepCurrencyCode: null,
        commencementOfInsurance: null,
        termOfContract: null,
        notes: "",
        memeberNr: "",
        contractDate: null,
        untilDate: null,
        durationInMonths: "0",
        cancellationUntilDate: null,
        cancellationInMonths: "0");
  }
}

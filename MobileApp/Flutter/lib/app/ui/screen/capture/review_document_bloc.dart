import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:rxdart/subjects.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/share_document_request.dart';
import 'package:xoonit/app/ui/component/compose_mail_component.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class ReviewDocumentBloc extends BlocBase {
  BehaviorSubject<AppState> _screenState =
      BehaviorSubject.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  @override
  void dispose() {
    _screenState.close();
  }

  onShowDialogComposemail(
      BuildContext context,
      TextEditingController mailAddressController,
      TextEditingController subjectMailController,
      TextEditingController contentMailController,
      String idDocumentContainerScan) {
    showDialog(
      context: context,
      builder: (context) => ShowPopUpComposeMail(
          mailAddressController: mailAddressController,
          subjectMailController: subjectMailController,
          contentMailController: contentMailController,
          onClose: () {
            Navigator.of(context).pop();
          },
          sendMail: () {
            Navigator.of(context).pop(true);
          }),
    ).then((value) {
      if (value != null) {
        if (value.runtimeType == bool && value as bool == true) {
          onShareDocumentToMail(
              context,
              mailAddressController.text,
              subjectMailController.text,
              contentMailController.text,
              idDocumentContainerScan);
        }
      }
    });
  }

  onShareDocumentToMail(BuildContext context, String mail, String subject,
      String contentBody, String idDocumentContainerScan) {
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
                return DialogMessage(
                  title: "Notification",
                  message: "Successfully !",
                  onOKButtonPressed: () {
                    Navigator.of(context).pop();
                  },
                );
              } else {
                return DialogMessage(
                  title: "Notification",
                  message: "Share document failed !",
                  onOKButtonPressed: () {
                    Navigator.of(context).pop();
                  },
                );
              }
            },
          )
        });
  }

  void downloadFile(BuildContext context, String idDocumentContainerScans,
      String documentName) async {
    try {
      String url = GeneralMethod.getDownloadURL(idDocumentContainerScans);
      if (Platform.isAndroid) {
        Directory savePath = await getExternalStorageDirectory();
        printLog(savePath.path);
        await Dio().download(
          url,
          savePath.path + "/$documentName.pdf",
          onReceiveProgress: (received, total) {
            if (total != -1) {
              printLog((received / total * 100).toStringAsFixed(0) + "%");
            }
          },
        );
      } else {
        Directory savePath = await getApplicationSupportDirectory();
        await Dio().download(
          url,
          savePath.path + "/$documentName.pdf",
          onReceiveProgress: (received, total) {
            if (total != -1) {
              printLog((received / total * 100).toStringAsFixed(0) + "%");
            }
          },
        );
      }
    } catch (e) {
      printLog(e);
    }
  }

  printDocument(String idDocumentContainerScans, String documentName) async {
    try {
     
      String url = GeneralMethod.getDownloadURL(idDocumentContainerScans);
      Directory savePath;

      if (Platform.isAndroid) {
        savePath = await getExternalStorageDirectory();
      } else {
        savePath = await getApplicationSupportDirectory();
      }

      String localPathURL = savePath.path + "/Print/$documentName.pdf";
      await Dio().download(url, localPathURL);
      printLog(localPathURL);

      File file = File(localPathURL);
      await Printing.layoutPdf(onLayout: (PdfPageFormat format) {
       return file.readAsBytesSync();
      });
    } catch (e) {
      printLog(e);
    }
  }

}

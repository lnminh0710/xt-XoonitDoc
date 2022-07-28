import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/app/ui/screen/history/history_widget/custom_item_list_history.dart';
import 'package:xoonit/core/ultils.dart';

class AllComponentUI extends StatefulWidget {
  AllComponentUI({Key key}) : super(key: key);

  @override
  _AllComponentUIState createState() => _AllComponentUIState();
}

class _AllComponentUIState extends State<AllComponentUI> {
  HistoryItem mockItemHistory = new HistoryItem(
      cloud: "cloud",
      devices: "mobile",
      docType: "invoices",
      fileName: "Scan0123",
      scanTime: "07:00:00:000",
      scanDate: "20/02/2020",
      syncStatus: "Done",
      totalDocument: "10");

  CaptureResponse mockItemCapture = new CaptureResponse(
      scannedPath:
          "https://images.pexels.com/photos/616849/pexels-photo-616849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      createDate: "20/02/2020",
      documentName: "capture.tiff.png",
      documentType: "Invoices",
      idDocumentContainerScans: "100",
      numberOfImages: "1");

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: MyColors.primaryColor,
      body: Container(
        height: Dimension.getHeight(1),
        width: Dimension.getWidth(1),
        padding: EdgeInsets.only(left: 50, right: 50),
        margin: EdgeInsets.only(top: 50),
        child: SingleChildScrollView(
          child: Column(
            children: <Widget>[
              CustomCardViewHistory(
                item: mockItemHistory,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_bloc.dart';

class BottomSheetReviewDocument extends StatefulWidget {
  final ReviewDocumentBloc reviewDocumentBloc;
  final String idDocumentContainerScans;
  final String documentName;

  BottomSheetReviewDocument(
      {Key key,
      this.reviewDocumentBloc,
      this.idDocumentContainerScans,
      this.documentName})
      : super(key: key);

  @override
  _BottomSheetReviewDocumentState createState() =>
      _BottomSheetReviewDocumentState();
}

class _BottomSheetReviewDocumentState extends State<BottomSheetReviewDocument> {
  String documentName;
  @override
  void initState() {
    super.initState();
    documentName = widget.documentName;
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(10), topRight: Radius.circular(10)),
          color: MyColors.whiteBackground,
        ),
        child: Column(children: <Widget>[
          Container(
            padding: EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(10), topRight: Radius.circular(10)),
              color: MyColors.whiteBackground,
            ),
            child: Container(
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.all(Radius.circular(10)),
                  color: Colors.blueGrey[300]),
              width: 50,
              height: 4,
            ),
          ),
          Container(
            padding: EdgeInsets.all(8),
            child: Text(
              documentName,
              style: MyStyleText.blueDarkColor16Medium,
              softWrap: true,
              textAlign: TextAlign.center,
            ),
          ),
          Divider(
            color: MyColors.greyColor,
          ),
          FlatButton(
            padding: EdgeInsets.all(16),
            child: Row(
              children: <Widget>[
                Icon(
                  Icons.share,
                  color: Colors.blue,
                ),
                SizedBox(
                  width: 12,
                ),
                Text(
                  "Share",
                  style: MyStyleText.black14Regular,
                ),
              ],
            ),
            onPressed: () {
              Navigator.of(context).pop(BottomSheetActions.SHARE);
            },
          ),
          FlatButton(
            padding: EdgeInsets.all(16),
            child: Row(children: <Widget>[
              Icon(
                Icons.cloud_download,
                color: Colors.green,
              ),
              SizedBox(
                width: 12,
              ),
              Text(
                "Download",
                style: MyStyleText.black14Regular,
              )
            ]),
            onPressed: () {
              Navigator.of(context).pop(BottomSheetActions.DOWNLOAD);
            },
          ),
          FlatButton(
            padding: EdgeInsets.all(16),
            child: Row(children: <Widget>[
              Icon(
                Icons.mail_outline,
                color: Colors.red,
              ),
              SizedBox(
                width: 12,
              ),
              Text(
                "Send My Mail",
                style: MyStyleText.black14Regular,
              )
            ]),
            onPressed: () {
              Navigator.of(context).pop(BottomSheetActions.SENDMAIL);
            },
          ),
          FlatButton(
            padding: EdgeInsets.all(16),
            child: Row(children: <Widget>[
              Icon(
                Icons.print,
                color: Colors.grey,
              ),
              SizedBox(
                width: 12,
              ),
              Text(
                "Print",
                style: MyStyleText.black14Regular,
              )
            ]),
            onPressed: () {
              Navigator.of(context).pop(BottomSheetActions.PRINT);
            },
          ),
          FlatButton(
            padding: EdgeInsets.all(16),
            child: Row(children: <Widget>[
              Icon(
                Icons.delete,
                color: MyColors.redColor,
              ),
              SizedBox(
                width: 12,
              ),
              Text(
                "Delete",
                style: TextStyle(
                  color: MyColors.redColor,
                  fontSize: 14,
                  fontWeight: FontWeight.normal,
                  fontFamily: FontFamily.robotoMedium,
                ),
              ),
            ]),
            onPressed: () {
              Navigator.of(context).pop(BottomSheetActions.DELETE);
            },
          ),
        ]),
      ),
    );
  }
}

enum BottomSheetActions { SHARE, DOWNLOAD, SENDMAIL, PRINT, DELETE }

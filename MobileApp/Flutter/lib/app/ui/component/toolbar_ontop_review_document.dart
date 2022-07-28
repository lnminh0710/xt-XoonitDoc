import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/core/ultils.dart';

class ToolbarTopReviewDoc extends StatelessWidget {
  final bool isMydmPage;
  final Function onShareOtherMail;
  final Function onDownloadDocument;
  final Function onSendToMail;
  final Function onPrintDocument;
  final Function onShowGroupPages;
  final Function onShowKeyWord;
  final Function onShowToDoList;
  final Function onEditDocument;

  ToolbarTopReviewDoc(
      {Key key,
      @required this.onShareOtherMail,
      @required this.onDownloadDocument,
      @required this.onSendToMail,
      @required this.onPrintDocument,
      @required this.onShowGroupPages,
      this.onShowKeyWord,
      this.onShowToDoList,
      @required this.isMydmPage,
      this.onEditDocument})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: Dimension.getWidth(1),
      color: MyColors.bluedarkColor,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children:<Widget>[
          IconButton(
            icon: Image.asset(Resources.iconShareFile),
            onPressed: () {
              onShareOtherMail();
            },
          ),
          IconButton(
            icon: Image.asset(Resources.iconDownload),
            onPressed: () {
              onDownloadDocument();
            },
          ),
          IconButton(
            icon: Image.asset(Resources.iconEmail),
            onPressed: () {
              onSendToMail();
            },
          ),
          IconButton(
            icon: Image.asset(Resources.iconPrinter),
            onPressed: () {
              onPrintDocument();
            },
          ),
          IconButton(
            icon: Image.asset(Resources.iconGroup),
            onPressed: () {
              onShowGroupPages();
            },
          ),
          isMydmPage
              ? IconButton(
                  icon: Image.asset(Resources.iconPencilSmall),
                  onPressed: () {
                    onEditDocument();
                  },
                )
              : Container(),
          isMydmPage
              ? Container()
              : IconButton(
                  icon: Image.asset(Resources.iconKeyword),
                  onPressed: () {
                    onShowKeyWord();
                  },
                ),
          isMydmPage
              ? Container()
              : IconButton(
                  icon: Image.asset(Resources.iconTodoList),
                  onPressed: () {
                    onShowToDoList();
                  },
                ),
        ],
      ),
    );
  }
}

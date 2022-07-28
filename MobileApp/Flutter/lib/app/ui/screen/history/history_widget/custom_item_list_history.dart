import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/core/ultils.dart';

class CustomCardViewHistory extends StatelessWidget {
  final HistoryItem item;

  CustomCardViewHistory({Key key, this.item}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color headerColor;
    switch (item.syncStatus) {
      case "Done":
        headerColor = MyColors.syncDone;
        break;
      case "Error":
        headerColor = MyColors.syncError;
        break;
      case "Loading":
        headerColor = MyColors.syncLoading;
        break;
      default:
        headerColor = MyColors.syncLoading;
    }

    return Card(
      margin: EdgeInsets.only(left: 12, right: 12, bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: Container(
        height: 164,
        decoration: BoxDecoration(
          color: MyColors.bluedarkColor,
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        child: Column(
          children: <Widget>[
            Container(
              width: Dimension.getWidth(1),
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(10),
                    topRight: Radius.circular(10)),
                color: headerColor,
              ),
              child: Text(
                item.syncStatus??'',
                style: MyStyleText.textTitleSync,
                textAlign: TextAlign.center,
              ),
            ),
            Expanded(
              child: Container(
                margin: EdgeInsets.only(top: 8, bottom: 8),
                alignment: Alignment.center,
                child: Column(
                  children: <Widget>[
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Container(
                            margin: EdgeInsets.only(left: 16),
                            child: Text(
                              'File Name',
                              style: MyStyleText.white14Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.6),
                              child: item.fileName != null
                                  ? Text(
                                      item.fileName,
                                      style: MyStyleText.white14Medium,
                                      overflow: TextOverflow.ellipsis,
                                    )
                                  : Text(""))
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Container(
                            margin: EdgeInsets.only(left: 16),
                            child: Text(
                              'Toltal Images',
                              style: MyStyleText.white14Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.6),
                              child: item.totalDocument != null
                                  ? Text(item.totalDocument.toString(),
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.white14Medium)
                                  : Text(""))
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Container(
                            margin: EdgeInsets.only(left: 16),
                            child: Text(
                              'Doc Type',
                              style: MyStyleText.white14Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.6),
                              child: item.docType != null
                                  ? Text(item.docType,
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.white14Medium)
                                  : Text(""))
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Container(
                            margin: EdgeInsets.only(left: 16),
                            child: Text(
                              'Scanned Date',
                              style: MyStyleText.white14Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.6),
                              child: item.scanDate != null
                                  ? Text(item.scanDate,
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.white14Medium)
                                  : Text(""))
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Container(
                            margin: EdgeInsets.only(left: 16),
                            child: Text(
                              'Cloud',
                              style: MyStyleText.white14Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.6),
                              child: item.cloud != null
                                  ? Text(item.cloud,
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.white14Medium)
                                  : Text(""))
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

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
    return Card(
      margin: EdgeInsets.only(left: 16, right: 16, bottom: 8, top: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: Container(
        height: 142,
        decoration: BoxDecoration(
          color: MyColors.whiteColor,
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        child: Column(
          children: <Widget>[
            Expanded(
              child: Container(
                margin: EdgeInsets.only(top: 18, bottom: 8),
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
                              style: MyStyleText.blueDarkColor16Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.5),
                              child: item.fileName != null
                                  ? Text(
                                      item.fileName,
                                      style: MyStyleText.bluedarkColor16Regular,
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
                              'Doctype',
                              style: MyStyleText.blueDarkColor16Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.5),
                              child: item.docType != null
                                  ? Text(item.docType.toString(),
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.bluedarkColor16Regular)
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
                              'Scan Time',
                              style: MyStyleText.blueDarkColor16Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.5),
                              child: item.scanTime != null
                                  ? Text(item.scanTime,
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.bluedarkColor16Regular)
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
                              style: MyStyleText.blueDarkColor16Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.5),
                              child: item.scanDate != null
                                  ? Text(item.scanDate,
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.bluedarkColor16Regular)
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
                              style: MyStyleText.blueDarkColor16Medium,
                            ),
                          ),
                          Container(
                              width: Dimension.getWidth(0.5),
                              child: item.cloud != null
                                  ? Text(item.cloud,
                                      overflow: TextOverflow.ellipsis,
                                      style: MyStyleText.bluedarkColor16Regular)
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

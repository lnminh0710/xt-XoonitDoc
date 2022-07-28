import 'package:caminada/app/constants/styles.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/model/history_response.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/core/ultils.dart';

class CustomCardViewHistory extends StatelessWidget {
  final HistoryData item;

  CustomCardViewHistory({Key key, this.item}) : super(key: key);
  Widget uiIconAndCount(String iconPath, String text) {
    return Row(
      children: <Widget>[
        Container(
            child: Image(
          image: AssetImage(iconPath),
          height: 30,
          width: 30,
        )),
        Container(
            padding: EdgeInsets.only(
              left: 6,
            ),
            child: item.scan != null
                ? Text(
                    text,
                    style: MyStyleText.black16Regular,
                    overflow: TextOverflow.ellipsis,
                  )
                : Text("")),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(left: 20, right: 20, bottom: 0, top: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: Container(
        padding: EdgeInsets.all(16),
        // width: Dimension.getWidth(1),
        // height: 160,
        alignment: Alignment.topLeft,
        decoration: BoxDecoration(
          color: MyColors.whiteColor,
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        child: Column(
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(),
                  child: Text(
                    'Full Name:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                Expanded(
                  child: Container(
                      padding: EdgeInsets.only(left: 22),
                      child: item.fullName != null
                          ? Text(
                              item.fullName,
                              style: TextStyle(fontSize: 16),
                              overflow: TextOverflow.ellipsis,
                            )
                          : Text("")),
                )
              ],
            ),
            Row(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(
                    top: 6,
                  ),
                  child: Text(
                    'Email:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                Expanded(
                  child: Container(
                    padding: EdgeInsets.only(top:6,left:54),
                    child: item.email != null 
                        ? Text(
                            item.email,
                            style: TextStyle(fontSize: 16),
                            overflow: TextOverflow.ellipsis,
                          )
                        : Text(""),
                  ),
                ),
              ],
            ),
            Row(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(
                    top: 6,
                  ),
                  child: Text(
                    'Scan Date:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                Container(
                    padding: EdgeInsets.only(top: 6, left: 22),
                    child: item.scanDate != null
                        ? Text(
                            item.scanDate,
                            style: TextStyle(fontSize: 16),
                            overflow: TextOverflow.ellipsis,
                          )
                        : Text(""))
              ],
            ),
            Container(
              margin: EdgeInsets.symmetric(
                vertical: 12.0,
                horizontal: 0,
              ),
              width: Dimension.getWidth(1),
              height: 1,
              color: MyColors.greyText3,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[
                uiIconAndCount(
                    Resources.iconScanItemCaminada, item.scan.toString()),
                uiIconAndCount(Resources.iconImportItemCaminada,
                    item.datumImport.toString()),
                uiIconAndCount(
                    Resources.iconUploadItemCaminada, item.mobile.toString()),
                uiIconAndCount(Resources.iconTransferringItemCaminada,
                    item.transferring.toString()),
                uiIconAndCount(Resources.iconTransferredItemCaminada,
                    item.transferred.toString()),
              ],
            )
          ],
        ),
      ),
    );
  }
}

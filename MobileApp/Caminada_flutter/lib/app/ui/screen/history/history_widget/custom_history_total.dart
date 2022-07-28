import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/model/history_response.dart';
import 'package:caminada/core/ultils.dart';

class CustomCardTotalHistory extends StatelessWidget {
  final TotalSummary item;
 

  CustomCardTotalHistory({Key key, this.item}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color headerColor;
    return Card(
      margin: EdgeInsets.only(left: 20, right: 20, bottom: 12, top: 32),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: Container(
        height: 130,
        decoration: BoxDecoration(
          color: MyColors.backgroundTotal,
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        child: Column(
          children: <Widget>[
            Container(
              margin: EdgeInsets.only(top: 9, left: 12),
              width: Dimension.getWidth(1),
              height: 21,
              alignment: Alignment.topLeft,
              child: Text(
                'TOTAL',
                style: MyStyleText.black18Bold,
                textAlign: TextAlign.center,
              ),
            ),
            Row(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(top: 6, left: 12),
                  child: Image(image: AssetImage(Resources.iconScanCaminada)),
                ),
                Container(
                  padding: EdgeInsets.only(top: 9, left: 8),
                  child: Text(
                    'Scan:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                Container(
                  padding: EdgeInsets.only(top: 9, left: 32),
                  child: item.scan !=null ? Text(
                    item.scan.toString(),
                    style: TextStyle(fontSize: 16),
                  ):Text(""),
                ),
                Container(
                  padding: EdgeInsets.only(top: 6, left: 20),
                  child: Image(image: AssetImage(Resources.iconTransferringCaminada)),
                ),
                Container(
                  padding: EdgeInsets.only(top: 10, left: 10),
                  child: Text(
                    'Transferring:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                  Container(
                  padding: EdgeInsets.only(top: 9, left: 6),
                  child: item.transferring !=null ? Text(
                    item.transferring.toString(),
                    style: TextStyle(fontSize: 16),
                  ):Text(""),
                ),
              ],
            ),
            Row(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(top: 6, left: 12),
                  child: Image(image: AssetImage(Resources.iconImportCaminada)),
                ),
                Container(
                  padding: EdgeInsets.only(top: 9, left: 8),
                  child: Text(
                    'Import:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                   Container(
                  padding: EdgeInsets.only(top: 9, left: 20),
                  child: item.totalSummaryImport !=null ? Text(
                    item.totalSummaryImport.toString(),
                    style: TextStyle(fontSize: 16),
                  ):Text(""),
                ),
                Container(
                  padding: EdgeInsets.only(top: 6, left: 20),
                  child: Image(image: AssetImage(Resources.iconTransferredCaminada)),
                ),
                Container(
                  padding: EdgeInsets.only(top: 10, left: 8),
                  child: Text(
                    'Transferred:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                  Container(
                  padding: EdgeInsets.only(top: 9, left: 10),
                  child: item.transferred !=null ? Text(
                    item.transferred.toString(),
                    style: TextStyle(fontSize: 16),
                  ):Text(""),
                ),
              ],
            ),
            Row(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(top: 6, left: 12),
                  child: Image(image: AssetImage(Resources.iconUploadCaminada)),
                ),
                Container(
                  padding: EdgeInsets.only(top: 9, left: 8),
                  child: Text(
                    'Upload:',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                 Container(
                  padding: EdgeInsets.only(top: 9, left: 20),
                  child: item.mobile !=null ? Text(
                    item.mobile.toString(),
                    style: TextStyle(fontSize: 16),
                  ):Text(""),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

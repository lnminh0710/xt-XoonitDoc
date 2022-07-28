import 'package:flutter/cupertino.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';

class FileAndFolderCount extends StatelessWidget {
  final int fileParentCount;
  final int allFileCount;
  final bool hasSubFolder;
  const FileAndFolderCount(
      {Key key, @required this.allFileCount, @required this.fileParentCount, this.hasSubFolder = true})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 24,
        child: Row(
          children: <Widget>[
            hasSubFolder 
                ? Container(
                    padding: EdgeInsets.only(left: 8, right: 8),
                    child: Text(
                      fileParentCount < 100 ? fileParentCount.toString() : '99+',
                      style: MyStyleText.white12Bold,
                    ),
                  )
                : Container(),
            Container(
              height: 24,
              alignment: Alignment.center,
              padding: EdgeInsets.only(left: 12, right: 12),
              decoration: BoxDecoration(
                color: MyColors.grey1,
                borderRadius: BorderRadius.circular(100),
                shape: BoxShape.rectangle,
              ),
              child: Text(
                allFileCount < 100 ? allFileCount.toString() : '99+',
                style: MyStyleText.white12Bold,
              ),
            )
          ],
        ),
        decoration: BoxDecoration(
          color: MyColors.blueLight,
          borderRadius: BorderRadius.circular(100),
          shape: BoxShape.rectangle,
        ));
  }
}

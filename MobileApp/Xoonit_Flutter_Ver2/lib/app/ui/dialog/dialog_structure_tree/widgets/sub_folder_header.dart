import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';

class SubFolderHeader extends StatelessWidget {
  const SubFolderHeader(
      {Key key,
      @required this.onBackPressed,
      @required this.title,
      @required this.onClosePressed,
      this.titleStyle})
      : super(key: key);
  final Function onBackPressed;
  final Function onClosePressed;
  final String title;
  final TextStyle titleStyle;
  @override
  Widget build(BuildContext context) {
    return Container(
      color: MyColors.blueDark3,
      child: Container(
        child: Row(
          children: <Widget>[
            IconButton(
                splashColor: Colors.transparent,
                icon: Icon(
                  Icons.chevron_left,
                  color: MyColors.whiteColor,
                ),
                onPressed: () {
                  onBackPressed();
                }),
            Expanded(
              child: Container(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: titleStyle != null
                        ? titleStyle
                        : MyStyleText.white14Bold,
                  )),
            ),
            IconButton(
                splashColor: Colors.transparent,
                icon: Icon(
                  Icons.close,
                  color: MyColors.whiteColor,
                ),
                onPressed: () {
                  onClosePressed();
                }),
          ],
        ),
      ),
    );
  }
}

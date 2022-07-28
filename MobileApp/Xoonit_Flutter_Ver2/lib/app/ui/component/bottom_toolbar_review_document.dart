import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';

class BottomToolbar extends StatelessWidget {
  final Function onResetStatus;
  final Function onRotationLeft;
  final Function onRotationRight;
  final Function onZoomIn;
  final Function onZoomOut;

  BottomToolbar(
      {Key key,
      this.onRotationLeft,
      this.onRotationRight,
      this.onZoomIn,
      this.onZoomOut,
      this.onResetStatus})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return _buildBottomToolbar();
  }

  _buildBottomToolbar() => Card(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10))),
        color: MyColors.bluedarkColor,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: <Widget>[
              onResetStatus != null
                  ? IconButton(
                      padding: EdgeInsets.all(12),
                      icon: Image.asset(Resources.iconResetStatus),
                      onPressed: () {
                        onResetStatus();
                      })
                  : SizedBox.shrink(),
              onRotationLeft != null
                  ? IconButton(
                      padding: EdgeInsets.all(12),
                      icon: Image.asset(Resources.iconRotationLeft),
                      onPressed: () {
                        onRotationLeft();
                      })
                  : SizedBox.shrink(),
              onRotationRight != null
                  ? IconButton(
                      padding: EdgeInsets.all(12),
                      icon: Image.asset(Resources.iconRotationRight),
                      onPressed: () {
                        onRotationRight();
                      })
                  : SizedBox.shrink(),
              onZoomIn != null
                  ? IconButton(
                      padding: EdgeInsets.all(10),
                      icon: Image.asset(Resources.iconZoomIn),
                      onPressed: () {
                        onZoomIn();
                      })
                  : SizedBox.shrink(),
              onZoomOut != null
                  ? IconButton(
                      padding: EdgeInsets.all(10),
                      icon: Image.asset(Resources.iconZoomOut),
                      onPressed: () {
                        onZoomOut();
                      })
                  : SizedBox.shrink(),
            ],
          ),
        ),
      );
}

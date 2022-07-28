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
      @required this.onRotationLeft,
      @required this.onRotationRight,
      @required this.onZoomIn,
      @required this.onZoomOut,
      @required this.onResetStatus})
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
          padding: EdgeInsets.only(left: 12, right: 12),
          child: Row(
            children: <Widget>[
              IconButton(
                  padding: EdgeInsets.all(12),
                  icon: Image.asset(Resources.iconResetStatus),
                  onPressed: () {
                    onResetStatus();
                  }),
              IconButton(
                  padding: EdgeInsets.all(12),
                  icon: Image.asset(Resources.iconRotationLeft),
                  onPressed: () {
                    onRotationLeft();
                  }),
              IconButton(
                  padding: EdgeInsets.all(12),
                  icon: Image.asset(Resources.iconRotationRight),
                  onPressed: () {
                    onRotationRight();
                  }),
              IconButton(
                  padding: EdgeInsets.all(10),
                  icon: Image.asset(Resources.iconZoomIn),
                  onPressed: () {
                    onZoomIn();
                  }),
              IconButton(
                  padding: EdgeInsets.all(10),
                  icon: Image.asset(Resources.iconZoomOut),
                  onPressed: () {
                    onZoomOut();
                  }),
            ],
          ),
        ),
      );
}

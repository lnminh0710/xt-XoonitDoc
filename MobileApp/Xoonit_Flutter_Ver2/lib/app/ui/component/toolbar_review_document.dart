import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/core/ultils.dart';

class ToolbarReviewDocument extends StatelessWidget {
  final Function onShowGroupPages;
  final Function onShowKeyWord;
  final Function(bool) onShowToDoList;
  final Function onRotateDocument;
  final Function onOpenBottomSheet;
  final Function onShowPopupSelectFolder;
  final Function onSaveDocument;
  final bool isToDoChecked;
  ToolbarReviewDocument({
    Key key,
    @required this.onShowGroupPages,
    @required this.onShowKeyWord,
    @required this.onShowToDoList,
    @required this.onRotateDocument,
    @required this.onOpenBottomSheet,
    this.onShowPopupSelectFolder,
    this.isToDoChecked = false,
    @required this.onSaveDocument,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: Dimension.getWidth(1),
      color: MyColors.whiteBackground,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          onShowPopupSelectFolder != null
              ? Container(
                  margin: EdgeInsets.symmetric(vertical: 4),
                  child: IconButton(
                    icon: Icon(
                      Icons.library_books,
                      color: Colors.lightBlue,
                    ),
                    onPressed: () {
                      onShowPopupSelectFolder();
                    },
                  ),
                )
              : SizedBox.shrink(),
          Container(
            margin: EdgeInsets.symmetric(vertical: 4),
            child: IconButton(
              icon: Image.asset(Resources.iconKeyword),
              onPressed: () {
                onShowKeyWord();
              },
            ),
          ),
          ToDoListkWidget(
            isChecked: isToDoChecked,
            onChanged: onShowToDoList,
          ),
          Container(
            margin: EdgeInsets.symmetric(vertical: 4),
            child: IconButton(
              icon: Image.asset(Resources.iconGroup),
              onPressed: () {
                onShowGroupPages();
              },
            ),
          ),
          Container(
            margin: EdgeInsets.symmetric(vertical: 4),
            child: IconButton(
              icon: Image.asset(
                Resources.iconRotationLeft,
                width: 22,
                height: 22,
              ),
              onPressed: () {
                onRotateDocument();
              },
            ),
          ),
          Container(
            margin: EdgeInsets.symmetric(vertical: 4),
            child: IconButton(
              icon: Image.asset(
                Resources.iconSaveWithColor,
                width: 44,
                height: 44,
              ),
              onPressed: () {
                onSaveDocument();
              },
            ),
          ),
          Container(
            margin: EdgeInsets.symmetric(vertical: 4),
            child: IconButton(
              icon: Image.asset(Resources.icon3Dot),
              onPressed: () {
                onOpenBottomSheet();
              },
            ),
          ),
        ],
      ),
    );
  }
}

class ToDoListkWidget extends StatefulWidget {
  final bool isChecked;
  final double size;
  final ValueChanged<bool> onChanged;

  ToDoListkWidget({
    Key key,
    this.isChecked = false,
    this.size = 20,
    @required this.onChanged,
  }) : super(key: key);
  @override
  _ToDoListkWidgetState createState() => _ToDoListkWidgetState();
}

class _ToDoListkWidgetState extends State<ToDoListkWidget> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        widget.onChanged(!widget.isChecked);
      },
      child: Container(
        margin: EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              "Todo",
              style: MyStyleText.black14Medium,
            ),
            SizedBox(
              width: 3,
            ),
            Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    border: widget.isChecked
                        ? null
                        : Border.all(width: 2, color: MyColors.greyColor1),
                    borderRadius: BorderRadius.circular(5),
                    color: widget.isChecked
                        ? MyColors.greenCheckbox
                        : MyColors.greyLightColor),
                child: widget.isChecked
                    ? Icon(
                        Icons.check,
                        size: widget.size,
                        color: Colors.white,
                      )
                    : Container()),
          ],
        ),
      ),
    );
  }
}

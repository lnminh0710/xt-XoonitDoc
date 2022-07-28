import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';

class DialogMessage extends StatelessWidget {
  final String message;
  final String successMessage;
  final String faildMessage;
  final String title;
  final Function onOKButtonPressed;
  final Function onCancelButtonPressed;
  const DialogMessage(
      {this.onCancelButtonPressed,
      this.onOKButtonPressed,
      this.message = '',
      this.title = '',
      this.faildMessage = '',
      this.successMessage = '',
      key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      contentPadding: EdgeInsets.only(),
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16.0)),
          side: BorderSide(
            width: 1,
          )),
      title: title != ''
          ? Column(
              children: <Widget>[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Icon(
                      Icons.error_outline,
                      size: 16,
                      color: MyColors.blueLight,
                    ),
                    Container(
                        margin: EdgeInsets.only(left: 4),
                        child: Text(
                          title,
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        )),
                  ],
                ),
                Container(
                  margin: EdgeInsets.only(top: 8, bottom: 16),
                  height: 1,
                  color: MyColors.greyLowColor,
                ),
              ],
            )
          : Container(),
      content: Wrap(
        children: <Widget>[
          Container(
            margin: EdgeInsets.symmetric(
              vertical: 0,
              horizontal: 20.0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  height: 16,
                ),
                Container(
                  child: Text(
                    message,
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                Container(
                  child: successMessage != ''
                      ? Text(
                          '• ' + successMessage,
                          style: TextStyle(fontSize: 16),
                        )
                      : Container(),
                ),
                Container(
                  margin: EdgeInsets.only(top: faildMessage != '' ? 8 : 0),
                  child: faildMessage != ''
                      ? Text(
                          '• ' + faildMessage,
                          style:
                              TextStyle(fontSize: 16, color: MyColors.redColor),
                        )
                      : Container(),
                ),
                Container(
                  height: 32,
                ),
              ],
            ),
          ),
          Column(
            children: <Widget>[
              Container(
                margin: EdgeInsets.only(top: 8),
                height: 1,
                color: MyColors.greyLowColor,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  onCancelButtonPressed != null
                      ? Expanded(
                          child: GestureDetector(
                            onTap: onCancelButtonPressed,
                            child: Container(
                              decoration: ShapeDecoration(
                                  color: MyColors.whiteColor,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.only(
                                          bottomLeft: Radius.circular(16.0)))),
                              padding: EdgeInsets.only(top: 12, bottom: 12),
                              child: Text(
                                'Cancel',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    color: MyColors.greyColor1, fontSize: 16),
                              ),
                            ),
                          ),
                        )
                      : Container(
                          width: 0,
                          height: 0,
                        ),
                  onOKButtonPressed != null
                      ? Expanded(
                          child: GestureDetector(
                            onTap: onOKButtonPressed,
                            child: Container(
                              decoration: ShapeDecoration(
                                  color: MyColors.textLink,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.only(
                                          bottomRight: Radius.circular(16.0),
                                          bottomLeft:
                                              onCancelButtonPressed != null
                                                  ? Radius.zero
                                                  : Radius.circular(16.0)))),
                              padding: EdgeInsets.only(top: 12, bottom: 12),
                              child: Text(
                                'OK',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    color: Colors.white, fontSize: 16),
                              ),
                            ),
                          ),
                        )
                      : Container(
                          width: 0,
                          height: 0,
                        ),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }
}

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/component/button_gradient.dart';

class NotificationDialog extends StatelessWidget {
  NotificationDialog(
      {Key key,
      @required this.iconImages,
      @required this.title,
      @required this.message,
      @required this.possitiveButtonName,
      this.negativeButtonName,
      @required this.possitiveButtonOnClick,
      this.nagativeButtonOnCLick,
      this.body})
      : super(key: key);
  final Widget iconImages;
  final String title;
  final String message;
  final String possitiveButtonName;
  final String negativeButtonName;
  final Function(BuildContext) possitiveButtonOnClick;
  final Function(BuildContext) nagativeButtonOnCLick;
  final Widget body;
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(10))),
      title: Center(
          child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        direction: Axis.vertical,
        spacing: 8,
        children: [
          iconImages,
          Text(title, style: MyStyleText.bluedarkColor16Bold)
        ],
      )),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          message.isEmpty
              ? SizedBox.shrink()
              : Text(
                  message,
                  style: MyStyleText.dark14Regular,
                  textAlign: TextAlign.center,
                ),
          body != null ? Container(child: body) : Container(),
          SizedBox(height: 16),
          ConstrainedBox(
              constraints: const BoxConstraints(
                minHeight: 44,
                minWidth: double.infinity,
              ),
              child: Column(
                children: <Widget>[
                  ButtonGradient(
                    title: possitiveButtonName,
                    onPressed: () {
                      possitiveButtonOnClick(context);
                    },
                  ),
                  negativeButtonName != null
                      ? Container(
                          width: MediaQuery.of(context).size.width,
                          child: FlatButton(
                            onPressed: () {
                              nagativeButtonOnCLick(context);
                            },
                            child: Text(
                              negativeButtonName,
                              style: MyStyleText.grey14Medium,
                            ),
                          ),
                        )
                      : Container(),
                ],
              ))
        ],
      ),
    );
  }
}

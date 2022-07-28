import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class DialogMessage extends StatelessWidget {
  final String message;
  final String title;
  final Function onOKButtonPressed;
  final Function onCancelButtonPressed;
  const DialogMessage(
      {this.onCancelButtonPressed,
      this.onOKButtonPressed,
      this.message,
      this.title,
      key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: SingleChildScrollView(
        child: Text(message),
      ),
      actions: <Widget>[
        onCancelButtonPressed != null
            ? FlatButton(
                child: Text('Cancel'), onPressed: onCancelButtonPressed)
            : Container(
                width: 0,
                height: 0,
              ),
        onOKButtonPressed != null
            ? RaisedButton(child: Text('OK'), onPressed: onOKButtonPressed)
            : Container(
                width: 0,
                height: 0,
              ),
      ],
    );
  }
}

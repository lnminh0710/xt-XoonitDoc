import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ButtonGradient extends StatelessWidget {
  final String title;
  final Function onPressed;

  ButtonGradient({this.title = 'OK', @required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
        child: FlatButton(
          onPressed: onPressed,
          child: Center(
              child: Text(
            title,
          )),
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8.0),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue,
              Colors.orange,
            ],
          ),
        ));
  }
}

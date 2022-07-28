import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';

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
            style: MyStyleText.white14Medium,
          )),
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8.0),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              MyColors.blueGradientTop,
              MyColors.blueGradientBottom,
            ],
          ),
        ));
  }
}

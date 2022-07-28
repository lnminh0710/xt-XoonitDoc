import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/core/ultils.dart';

class CongratulationScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Future.delayed(Duration(seconds: 3)).then((__) {
      Navigator.of(context).pushNamedAndRemoveUntil(
          RoutesName.HOME_SCREEN, (Route<dynamic> route) => false);
    });
    return Scaffold(
        resizeToAvoidBottomInset: false,
        backgroundColor: MyColors.primaryColor,
        body: Container(
          padding: EdgeInsets.only(left: 50, right: 50),
          width: Dimension.getWidth(1),
          height: Dimension.getHeight(1),
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(Resources.splashBackground),
              fit: BoxFit.cover,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Center(
                  child: Container(
                      child: Image.asset(Resources.iconConratulation))),
              Container(
                  margin: EdgeInsets.only(top: 16),
                  child: Text('Congratulations!',
                      style: MyStyleText.white16Medium)),
              Container(
                  margin: EdgeInsets.only(top: 8),
                  child: Text('You are now a member of Xoonit',
                      style: MyStyleText.white16Medium)),
            ],
          ),
        ));
  }
}

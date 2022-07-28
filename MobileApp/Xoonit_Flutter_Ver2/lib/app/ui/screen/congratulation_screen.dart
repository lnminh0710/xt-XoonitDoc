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
    Future.delayed(Duration(seconds: 10)).then((__) {
      Navigator.of(context).pushNamedAndRemoveUntil(
          RoutesName.LOGIN_SCREEN, (Route<dynamic> route) => false);
    });
    return Scaffold(
        resizeToAvoidBottomInset: false,
        backgroundColor: MyColors.whiteBackground,
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
            child: Container(
                alignment: Alignment.topLeft,
                child: Column(children: <Widget>[
                  Container(
                      alignment: Alignment.topLeft,
                      margin: EdgeInsets.only(top: 72),
                      child: Image.asset(Resources.xoonitLogoSmall)),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 60),
                      child: Text(
                        'Success!',
                        style: TextStyle(
                            color: MyColors.blackColor,
                            fontSize: 24,
                            fontFamily: FontFamily.robotoMedium),
                      ),
                    ),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    margin: EdgeInsets.only(top: 40),
                    child: Text(
                        'Your account has been successfully created.\nPlease check your email to set the password.',
                        style: TextStyle(
                            color: MyColors.blackColor,
                            fontSize: 14,
                            fontFamily: FontFamily.robotoMedium)),
                  ),
                ]))));
  }
}

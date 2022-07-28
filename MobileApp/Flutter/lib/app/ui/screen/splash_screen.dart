import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/core/ultils.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Dimension.height = MediaQuery.of(context).size.height;
    Dimension.width = MediaQuery.of(context).size.width;
    SystemChrome.setEnabledSystemUIOverlays([]);
    return Scaffold(
        backgroundColor: MyColors.primaryColor,
        body: Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(Resources.splashBackground),
              fit: BoxFit.cover,
            ),
          ),
          height: Dimension.getHeight(1),
          child: SingleChildScrollView(
            child: Column(
              children: <Widget>[
                Container(
                  margin: EdgeInsets.only(top: 200),
                  child: Center(
                    child: Text(
                      "Welcome to",
                      style: MyStyleText.white18Light,
                    ),
                  ),
                ),
                Container(
                    margin: EdgeInsets.only(top: 8),
                    child: Center(
                        child: Image(image: AssetImage(Resources.xoonitLogo)))),
                Container(
                    margin: EdgeInsets.only(top: 100),
                    child: Center(
                        child: Image(image: AssetImage(Resources.splashLogo)))),
              ],
            ),
          ),
        ));
  }
}

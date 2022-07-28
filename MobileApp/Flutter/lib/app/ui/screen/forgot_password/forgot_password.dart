import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/ultils.dart';
import '../../../constants/colors.dart';
import '../../../constants/resources.dart';
import '../../../constants/styles.dart';
import '../../component/common_component.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    TextEditingController emailController = new TextEditingController();
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
        width: Dimension.getWidth(1),
        height: Dimension.getHeight(1),
        child: SingleChildScrollView(
            child: Container(
          padding: EdgeInsets.only(left: 50, right: 50, bottom: 50),
          child: Column(
            children: <Widget>[
              Container(
                  margin: EdgeInsets.only(top: 16),
                  child: Center(
                      child: Image(image: AssetImage(Resources.signupLogo)))),
              Container(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Forgot Password',
                  style: MyStyleText.white20Medium,
                ),
              ),
              Container(
                padding: EdgeInsets.only(top: 10),
                child: Text(
                  'Please enter your email address. You will receive a link to create a new password via email.',
                  style: MyStyleText.grey12Regular,
                ),
              ),
              Container(
                margin: EdgeInsets.only(top: 40),
                child: CustomTextField(
                  hintText: 'Your Email',
                  backgroundColor: MyColors.primaryColor,
                  width: Dimension.getWidth(1),
                  styleText: MyStyleText.white14Medium,
                  styleHintText: MyStyleText.hintColor14Medium,
                  controller: emailController,
                ),
              ),
            ],
          ),
        )),
      ),
    );
  }
}

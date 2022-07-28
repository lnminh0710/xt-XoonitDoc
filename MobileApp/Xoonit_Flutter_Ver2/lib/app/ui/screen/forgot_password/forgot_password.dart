import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/model/forgot_password_request.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/screen/forgot_password/forgot_password_bloc.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../../core/ultils.dart';
import '../../../constants/colors.dart';
import '../../../constants/resources.dart';
import '../../../constants/styles.dart';
import '../../../difinition.dart';
import '../../component/common_component.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    String _email;
    SystemChrome.setEnabledSystemUIOverlays([]);
    final _emailFieldKey = GlobalKey<FormFieldState<String>>();
    ForgotPasswordBloc forgotPasswordBloc = BlocProvider.of(context);

    return Scaffold(
      resizeToAvoidBottomInset: false,
      // resizeToAvoidBottomPadding: false,
      resizeToAvoidBottomPadding: false,
      body: StreamBuilder<AppState>(
          stream: forgotPasswordBloc.screenState,
          builder: (context, snapshot) {
            return Stack(
              children: <Widget>[
                Container(
                  width: Dimension.getWidth(1),
                  height: Dimension.getHeight(1),
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage(Resources.splashBackground),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: SingleChildScrollView(
                      child: Container(
                    padding: EdgeInsets.only(left: 50, right: 50, bottom: 50),
                    child: Column(
                      children: <Widget>[
                        Container(
                          margin: EdgeInsets.only(top: 72),
                          alignment: Alignment.centerLeft,
                          child: Image(
                            width: 70,
                            height: 20,
                            image: AssetImage(Resources.xoonitLogoSmall),
                            fit: BoxFit.scaleDown,
                          ),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 98),
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Forgot Password",
                            style: TextStyle(
                                color: MyColors.blackColor,
                                fontSize: 24,
                                fontFamily: FontFamily.robotoMedium),
                          ),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 40),
                          height: 80,
                          child: CommonTextFormField(
                            labelText: 'Email',
                            onSaved: (String value) {
                              return _email = value;
                            },
                            fieldKey: _emailFieldKey,
                            onTap: () {
                              _emailFieldKey.currentState.validate();
                            },
                            onChange: (value) {
                              _email = value;
                              _emailFieldKey.currentState.didChange(value);
                              _emailFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String value) {
                              _emailFieldKey.currentState.validate();
                            },
                            validator: (String value) {
                              Pattern pattern =
                                  r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
                              RegExp regex = new RegExp(pattern);
                              if (value.isEmpty) {
                                return 'Email is required';
                              } else {
                                if (!regex.hasMatch(value))
                                  return 'Format email is wrong';
                                else
                                  return null;
                              }
                            },
                          ),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 160),
                          child: CommonButton(
                            borderColor: MyColors.blueColor,
                            bgColor: MyColors.blueColor,
                            title: 'SUBMIT',
                            titleStyle: MyStyleText.white14Bold,
                            onTap: () {
                              if (_email == null) {
                                _emailFieldKey.currentState.validate();
                              } else {
                                forgotPasswordBloc.postforgotPassword(
                                    ForgotPasswordRequest(
                                      email: _email,
                                      currentDateTime:
                                          DateTime.now().toString(),
                                    ),
                                    context);
                              }
                            },
                          ),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 100),
                          child: Image(
                              width: 200,
                              height: 108,
                              image: AssetImage(Resources.splashLogo)),
                        ),
                      ],
                    ),
                  )),
                ),
                snapshot.hasData && snapshot.data == AppState.Loading
                    ? Container(
                        color: Colors.black54,
                        width: Dimension.getWidth(1),
                        height: Dimension.getHeight(1),
                        child: Center(
                          child: CustomLoading(),
                        ),
                      )
                    : Container(),
              ],
            );
          }),
    );
  }
}

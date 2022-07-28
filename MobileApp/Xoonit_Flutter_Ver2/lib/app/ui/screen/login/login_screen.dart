import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:toast/toast.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/login_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';

import 'package:xoonit/app/ui/screen/login/login_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import '../../../../core/ultils.dart';
import '../../../constants/colors.dart';
import '../../../constants/styles.dart';
import '../../../difinition.dart';
import '../../../routes/routes.dart';

class LoginScreen extends StatefulWidget {
  LoginScreen({Key key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String _password;
  String _email;
  final _emailFieldKey = GlobalKey<FormFieldState<String>>();
  final _passwordFieldKey = GlobalKey<FormFieldState<String>>();
  final FocusNode focusName = FocusNode();
  final FocusNode focusPassword = FocusNode();
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([]);
    LoginBloc loginBloc = BlocProvider.of(context);
    return WillPopScope(
        onWillPop: () async {
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return NotificationDialog(
                  iconImages: Image.asset(Resources.icDialogWarning),
                  title: "Warning !",
                  message: "Are you sure want to quit ?",
                  possitiveButtonName: "OK",
                  possitiveButtonOnClick: (_) {
                    exit(0);
                  },
                  negativeButtonName: "Cancel",
                  nagativeButtonOnCLick: (_) {
                    Navigator.of(context).pop();
                  },
                  body: SizedBox.shrink(),
                );
              });
          return false;
        },
        child: GestureDetector(
          onTap: () {
            FocusScopeNode currentFocus = FocusScope.of(context);
            if (!currentFocus.hasPrimaryFocus) {
              currentFocus.unfocus();
            }
          },
          child: Scaffold(
            resizeToAvoidBottomInset: false,
            // resizeToAvoidBottomPadding: false,
            resizeToAvoidBottomPadding: false,
            backgroundColor: MyColors.whiteColor,
            body: StreamBuilder<AppState>(
                stream: loginBloc.screenState,
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
                          child: StreamBuilder<bool>(
                              stream: loginBloc.isRemember,
                              builder: (context, isRememberSnapshot) {
                                if (isRememberSnapshot.hasData) {
                                  return Container(
                                    padding:
                                        EdgeInsets.only(left: 50, right: 50),
                                    child: Column(
                                      children: <Widget>[
                                        Container(
                                          margin: EdgeInsets.only(top: 72),
                                          alignment: Alignment.centerLeft,
                                          child: Image(
                                            width: 70,
                                            height: 20,
                                            image: AssetImage(
                                                Resources.xoonitLogoSmall),
                                            fit: BoxFit.scaleDown,
                                          ),
                                        ),
                                        Container(
                                          margin: EdgeInsets.only(top: 60),
                                          alignment: Alignment.centerLeft,
                                          child: Text(
                                            "Hello!",
                                            style: TextStyle(
                                                color: MyColors.blackColor,
                                                fontSize: 24,
                                                fontFamily:
                                                    FontFamily.robotoMedium),
                                          ),
                                        ),
                                        Padding(
                                          padding:
                                              const EdgeInsets.only(top: 40.0),
                                          child: Container(
                                            height: 80,
                                            child: CommonTextFormField(
                                              labelText: 'Email',
                                              focusNode: focusName,
                                              onSaved: (String value) {
                                                return _email = value;
                                              },
                                              fieldKey: _emailFieldKey,
                                              onTap: () {
                                                _emailFieldKey.currentState
                                                    .validate();
                                              },
                                              onChange: (value) {
                                                _email = value;
                                                _emailFieldKey.currentState
                                                    .didChange(value);
                                                _emailFieldKey.currentState
                                                    .validate();
                                              },
                                              onFieldSubmitted: (String value) {
                                                _emailFieldKey.currentState
                                                    .validate();
                                                FocusScope.of(context)
                                                    .requestFocus(
                                                        focusPassword);
                                                _passwordFieldKey.currentState
                                                    .validate();
                                              },
                                              validator: (String value) {
                                                Pattern pattern =
                                                    r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
                                                RegExp regex =
                                                    new RegExp(pattern);
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
                                        ),
                                        SizedBox(
                                          height: 5,
                                        ),
                                        Container(
                                          height: 80,
                                          child: CommonTextFormField(
                                            labelText: 'Password',
                                            focusNode: focusPassword,
                                            obscureText: _obscureText,
                                            suffixIcon: new GestureDetector(
                                              onTap: () {
                                                setState(() {
                                                  _obscureText = !_obscureText;
                                                  focusPassword.unfocus();
                                                });
                                              },
                                              child: Icon(
                                                _obscureText
                                                    ? Icons.visibility_off
                                                    : Icons.visibility,
                                                color: Colors.grey,
                                              ),
                                            ),
                                            onSaved: (String value) {
                                              return _password = value;
                                            },
                                            fieldKey: _passwordFieldKey,
                                            onTap: () {
                                              _passwordFieldKey.currentState
                                                  .validate();
                                            },
                                            onChange: (value) {
                                              _password = value;
                                              _passwordFieldKey.currentState
                                                  .didChange(value);
                                              _passwordFieldKey.currentState
                                                  .validate();
                                            },
                                            onFieldSubmitted: (String value) {
                                              _passwordFieldKey.currentState
                                                  .validate();
                                              focusPassword.unfocus();
                                            },
                                            validator: (String value) {
                                              Pattern pattern =
                                                  r'^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$';
                                              RegExp regexPassword =
                                                  new RegExp(pattern);
                                              if (value.isEmpty) {
                                                return 'Password is required ';
                                              } else {
                                                if (regexPassword
                                                    .hasMatch(value)) {
                                                  return 'Passwords is 9 letters and more characters with a mix of letters, number & symbols';
                                                } else
                                                  return null;
                                              }
                                            },
                                          ),
                                        ),
                                        Container(
                                          padding: EdgeInsets.only(top: 8),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: <Widget>[
                                              Expanded(
                                                child: CommonCheckbox(
                                                  onChanged: (bool isChecked) {
                                                    printLog(
                                                        'on remember checkbox change: ' +
                                                            isChecked
                                                                .toString());
                                                    loginBloc.setRemeberValue(
                                                        !isRememberSnapshot
                                                            .data);
                                                  },
                                                  description: 'Remember',
                                                  textStyle:
                                                      MyStyleText.grey14Medium,
                                                  isChecked:
                                                      isRememberSnapshot.data,
                                                ),
                                              ),
                                              GestureDetector(
                                                onTap: () async {
                                                  Navigator.of(context)
                                                      .pushNamed(RoutesName
                                                          .FORGOT_PASSWORD_SCREEN);
                                                },
                                                child: Text(
                                                  'Forgot password?',
                                                  style: MyStyleText
                                                      .textLink14Medium,
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                        Container(
                                          margin: EdgeInsets.only(top: 30),
                                          child: CommonButton(
                                            borderColor: MyColors.blueColor,
                                            bgColor: MyColors.blueColor,
                                            title: 'LOGIN',
                                            titleStyle: MyStyleText.white14Bold,
                                            onTap: () {
                                              loginBloc.callLoginApi(
                                                  new LoginRequest(
                                                    email: _email,
                                                    password: _password,
                                                  ),
                                                  context,
                                                  isRememberSnapshot.data);
                                            },
                                          ),
                                        ),
                                        Container(
                                          margin: EdgeInsets.only(top: 10),
                                          child: Row(
                                            children: <Widget>[
                                              Text(
                                                'Don\'t have an account?',
                                                style: MyStyleText.grey14Medium,
                                              ),
                                              Container(
                                                width: 8,
                                              ),
                                              GestureDetector(
                                                onTap: () {
                                                  printLog(
                                                      'on Sign Up button pressed');
                                                  Navigator.of(context)
                                                      .pushNamed(RoutesName
                                                          .SIGNUP_SCREEN);
                                                },
                                                child: Text(
                                                  'Sign up',
                                                  style: MyStyleText
                                                      .textLink14Medium,
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                        Container(
                                            alignment: Alignment.center,
                                            margin: EdgeInsets.only(top: 48),
                                            child: GestureDetector(
                                              onDoubleTap: () {
                                                var str = loginBloc
                                                    .changeBuildFavor();
                                                // Scaffold.of(context)
                                                //     .showSnackBar(SnackBar(
                                                //   content: Text(str),
                                                // ));
                                                // loginBloc.changeBuildFavor();
                                                Toast.show('$str', context);
                                              },
                                              child: Image(
                                                  width: 200,
                                                  height: 108,
                                                  image: AssetImage(
                                                      Resources.splashLogo)),
                                            )),
                                      ],
                                    ),
                                  );
                                } else {
                                  return Center(
                                    child: CircularProgressIndicator(),
                                  );
                                }
                              }),
                        ),
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
                          : Container()
                    ],
                  );
                }),
          ),
        ));
  }
}

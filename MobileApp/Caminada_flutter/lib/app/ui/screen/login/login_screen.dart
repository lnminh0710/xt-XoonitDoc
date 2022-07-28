import 'dart:io';

import 'package:caminada/app/ui/component/signup_component.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:toast/toast.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/login_request.dart';
import 'package:caminada/app/ui/component/common_component.dart';

import 'package:caminada/app/ui/dialog/dialog_message.dart';
import 'package:caminada/app/ui/screen/login/login_bloc.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:caminada/core/ultils.dart';

import '../../../../core/ultils.dart';
import '../../../constants/colors.dart';
import '../../../constants/styles.dart';
import '../../../difinition.dart';

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
              return DialogMessage(
                title: 'Message',
                message: 'Are you sure want to quit?',
                onCancelButtonPressed: () {
                  Navigator.of(context).pop();
                },
                onOKButtonPressed: () {
                  exit(0);
                },
              );
            });
        return false;
      },
      child:  GestureDetector(
      onTap: () {
        FocusScopeNode currentFocus = FocusScope.of(context);

        if (!currentFocus.hasPrimaryFocus) {
          currentFocus.unfocus();
        }
      },
              child: Scaffold(
            resizeToAvoidBottomInset: false,
   
            resizeToAvoidBottomPadding: false,
            
            body: Stack(
              alignment: Alignment.center,
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
                    padding: EdgeInsets.only(left: 25, right: 25, bottom: 50),
                    child: Column(
                      children: <Widget>[
                        Container(
                          margin: EdgeInsets.only(top: 50),
                          alignment: Alignment.centerLeft,
                          child: Image(
                            width: 148,
                            height: 25,
                            image: AssetImage(Resources.iconCaminada),
                            fit: BoxFit.scaleDown,
                          ),
                        ),
                        Container(
                            margin: EdgeInsets.only(top: 100),
                            alignment: Alignment.centerLeft,
                            child: Text(
                              "Welcome back!",
                              style: MyStyleText.black24Medium,
                            )),
                        Padding(
                          padding: const EdgeInsets.only(top: 65.0),
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
                                _emailFieldKey.currentState.validate();
                              },
                              onChange: (value) {
                                _email = value;
                                _emailFieldKey.currentState.didChange(value);
                                _emailFieldKey.currentState.validate();
                              },
                              onFieldSubmitted: (String value) {
                                _emailFieldKey.currentState.validate();
                                FocusScope.of(context)
                                    .requestFocus(focusPassword);
                                _passwordFieldKey.currentState.validate();
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
                        ),
                        SizedBox(
                          height: 10,
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
                              _passwordFieldKey.currentState.validate();
                            },
                            onChange: (value) {
                              _password = value;
                              _passwordFieldKey.currentState.didChange(value);
                              _passwordFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String value) {
                              _passwordFieldKey.currentState.validate();
                              focusPassword.unfocus();
                            },
                            validator: (String value) {
                              Pattern pattern =
                                  r'^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$';
                              RegExp regexPassword = new RegExp(pattern);
                              if (value.isEmpty) {
                                return 'Password is required ';
                              } else {
                                if (regexPassword.hasMatch(value)) {
                                  return 'Passwords is 9 letters and more characters with a mix of letters, number & symbols';
                                } else
                                  return null;
                              }
                            },
                          ),
                        ),
                        SizedBox(
                          height: 10,
                        ),
                        Container(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                              Expanded(
                                  child: StreamBuilder<bool>(
                                      stream: loginBloc.isRememberStream,
                                      initialData: false,
                                      builder: (context, isRememberSnapshot) {
                                        return CommonCheckbox(
                                          onChanged: (bool isChecked) {
                                            printLog(
                                                'on remember checkbox change: ' +
                                                    isChecked.toString());
                                            loginBloc.setRemeberValue(
                                                !isRememberSnapshot.data);
                                          },
                                          description: 'Remember',
                                          textStyle: MyStyleText.grey14Medium,
                                          isChecked: isRememberSnapshot.data,
                                        );
                                      })),
                            ],
                          ),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 30),
                          height: 50,
                          child: CommonButton(
                              borderColor: MyColors.blueColor,
                              bgColor: MyColors.blueColor,
                              title: 'LOGIN',
                              titleStyle: MyStyleText.white14Bold,
                              onTap: () {
                                if (_email == null || _password == null) {
                                  _emailFieldKey.currentState.validate();
                                  _passwordFieldKey.currentState.validate();
                                } else {
                                  loginBloc.callLoginApi(
                                      new LoginRequest(
                                        email: _email,
                                        password: _password,
                                      ),
                                      context,
                                      loginBloc.isRemember);
                                }
                              }),
                        ),
                        Stack(children: <Widget>[
                          Container(
                              alignment: Alignment.center,
                              margin: EdgeInsets.only(top: 40),
                              child: GestureDetector(
                                onDoubleTap: () {
                                  // var str = loginBloc.changeBuildFavor();
                                  // Toast.show('$str', context);
                                },
                                child: Image(
                                    height: 110,
                                    image:
                                        AssetImage(Resources.splashLogoDocument)),
                              )),
                          Container(
                            margin: EdgeInsets.only(top: 70),
                            width: 375,
                            height: 130,
                            child: Image(
                                width: 375,
                                height: 110,
                                image: AssetImage(Resources.browser)),
                          ),
                        ]),
                      ],
                    ),
                  )),
                ),
                StreamBuilder<AppState>(
                    stream: loginBloc.screenState,
                    initialData: AppState.Idle,
                    builder: (context, snapshot) {
                      return snapshot.data == AppState.Loading
                          ? Container(
                              color: Colors.black54,
                              width: Dimension.getWidth(1),
                              height: Dimension.getHeight(1),
                              child: Center(
                                child: CircularProgressIndicator(),
                              ),
                            )
                          : SizedBox.shrink();
                    })
              ],
            )),
      ),
    );
  }
}

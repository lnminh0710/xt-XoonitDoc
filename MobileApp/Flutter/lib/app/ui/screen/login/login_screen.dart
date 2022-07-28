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
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';

import 'package:xoonit/app/ui/dialog/dialog_message.dart';
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
  String _loginname;
  final _loginNameFieldKey = GlobalKey<FormFieldState<String>>();
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
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        // resizeToAvoidBottomPadding: false,
        resizeToAvoidBottomPadding: false,
        backgroundColor: MyColors.primaryColor,
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
                                padding: EdgeInsets.only(
                                    left: 50, right: 50, bottom: 50),
                                child: Column(
                                  children: <Widget>[
                                    Container(
                                      margin: EdgeInsets.only(top: 50),
                                      alignment: Alignment.centerLeft,
                                      child: Image(
                                        width: 59,
                                        height: 16,
                                        image: AssetImage(Resources.xoonitLogo),
                                        fit: BoxFit.scaleDown,
                                      ),
                                    ),
                                    Container(
                                      margin: EdgeInsets.only(top: 40),
                                      alignment: Alignment.centerLeft,
                                      child: Image(
                                        width: 156,
                                        height: 26,
                                        image:
                                            AssetImage(Resources.welcomeLogo),
                                        fit: BoxFit.scaleDown,
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.only(top: 45.0),
                                      child: Form(
                                        child: CommonTextFormField(
                                          labelText: 'Login Name',
                                          focusNode: focusName,                           
                                          prefixIcon: IconButton(
                                            icon: Image.asset(
                                              Resources.userName,
                                              width: 30,
                                              height: 30,
                                            ),
                                            onPressed: null,
                                          ),
                                          onSaved: (String value) {
                                            return _loginname = value;
                                          },
                                          fieldKey: _loginNameFieldKey,
                                          onTap: (){
                                            _loginNameFieldKey.currentState.validate();
                                          },
                                          onChange: (value) {
                                            _loginname = value;
                                            _loginNameFieldKey.currentState
                                                .didChange(value);
                                            _loginNameFieldKey.currentState
                                                .validate();
                                          },
                                          onFieldSubmitted: (String value) {
                                            _loginNameFieldKey.currentState
                                                .validate();
                                                FocusScope.of(context).requestFocus(focusPassword);
                                          },
                                          validator: (String value) {
                                            if (value.isEmpty) {
                                              return 'Login name is required';
                                            }
                                            return null;
                                          },
                                        ),
                                      ),
                                    ),
                                    Form(
                                      child: CommonTextFormField(
                                        labelText: 'Password',
                                        focusNode: focusPassword,
                                        prefixIcon: IconButton(
                                          icon: Image.asset(
                                            Resources.unLock,
                                            width: 30,
                                            height: 30,
                                          ),
                                          onPressed: null,
                                        ), 
                                        obscureText: _obscureText,
                                         onSaved: (String value) {
                                            return _password = value;
                                          },
                                          fieldKey: _passwordFieldKey,
                                          onTap: (){
                                            _passwordFieldKey.currentState.validate();
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
                                               
                                          },
                                          validator: (String value) {
                                            if (value.isEmpty) {
                                              return 'Password is required';
                                            }
                                            return null;
                                          },
                                        ),
                                      
                                    ),
                                    Container(
                                      margin: EdgeInsets.only(top: 40),
                                      child: CommonButton(
                                        borderColor: MyColors.blueColor,
                                        bgColor: MyColors.blueColor,
                                        title: 'LOGIN',
                                        titleStyle: MyStyleText.white14Bold,
                                        onTap: () {
                                          loginBloc.callLoginApi(
                                              new LoginRequest(
                                                loginName: _loginname,
                                                password: _password,
                                              ),
                                              context,
                                              isRememberSnapshot.data);
                                        },
                                      ),
                                    ),
                                    Container(
                                      margin: EdgeInsets.only(top: 28),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: <Widget>[
                                          Expanded(
                                            child: CommonCheckbox(
                                              onChanged: (bool isChecked) {
                                                printLog(
                                                    'on remember checkbox change: ' +
                                                        isChecked.toString());
                                                loginBloc.setRemeberValue(
                                                    !isRememberSnapshot.data);
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
                                              Navigator.of(context).pushNamed(
                                                  RoutesName
                                                      .FORGOT_PASSWORD_SCREEN);
                                            },
                                            child: Text(
                                              'Forgot password',
                                              style:
                                                  MyStyleText.textLink14Medium,
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
                                            var str =
                                                loginBloc.changeBuildFavor();
                                            // Scaffold.of(context)
                                            //     .showSnackBar(SnackBar(
                                            //   content: Text(str),
                                            // ));
                                            // loginBloc.changeBuildFavor();
                                            Toast.show('$str', context);
                                          },
                                          child: Image(
                                              width: 286,
                                              height: 155,
                                              image: AssetImage(
                                                  Resources.splashLogo)),
                                        )),
                                    Container(
                                      margin: EdgeInsets.only(top: 40),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: <Widget>[
                                          Text(
                                            'Don\'t have account?',
                                            style: MyStyleText.grey14Medium,
                                          ),
                                          Container(
                                            width: 8,
                                          ),
                                          GestureDetector(
                                            onTap: () {
                                              printLog(
                                                  'on Sign Up button pressed');
                                              Navigator.of(context).pushNamed(
                                                  RoutesName.SIGNUP_SCREEN);
                                            },
                                            child: Text(
                                              'Sign Up',
                                              style: MyStyleText.textLink16Bold,
                                            ),
                                          )
                                        ],
                                      ),
                                    )
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
                            child: CircularProgressIndicator(),
                          ),
                        )
                      : Container()
                ],
              );
            }),
      ),
    );
  }
}

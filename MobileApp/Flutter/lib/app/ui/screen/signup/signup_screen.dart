import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/signup_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/core/ultils.dart';

class SignupScreen extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _SignupScreen();
  }
}

class _SignupScreen extends State<SignupScreen> {
  String _passwordSignUp;
  String _fristname = "";
  String _lastname = "";
  String _loginname = "";
  String _comfirmpasswordSignUp = "";
  String _email = "";
  bool _obscureText = true;
  final _firstnameFieldKey = GlobalKey<FormFieldState<String>>();
  final _lastnameFieldKey = GlobalKey<FormFieldState<String>>();
  final _loginnameFieldKey = GlobalKey<FormFieldState<String>>();
  final _emailaddressFieldKey = GlobalKey<FormFieldState<String>>();
  final _passwordFieldKey = GlobalKey<FormFieldState<String>>();
  final _passwordComfirmFieldKey = GlobalKey<FormFieldState<String>>();
  final FocusNode focusFirstName = FocusNode();
  final FocusNode focusLastName = FocusNode();
  final FocusNode focusLoginName = FocusNode();
  final FocusNode focusEmail = FocusNode();
  final FocusNode focusPassword = FocusNode();
  final FocusNode focusComfirmPassword = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
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
        child: SingleChildScrollView(
          child: Container(
            child: Column(children: <Widget>[
              Row(
                children: <Widget>[
                  Container(
                    padding: EdgeInsets.only(bottom: 90),
                    alignment: Alignment.topLeft,
                    child: GestureDetector(
                        onTap: () {
                          Navigator.of(context).pop();
                        },
                        child: Image.asset(Resources.buttonback)),
                  ),
                  Container(
                    margin: EdgeInsets.only(top: 40),
                    alignment: Alignment.topCenter,
                    child: Image(
                      width: 228,
                      height: 207,
                      image: AssetImage(Resources.signupLogo),
                      fit: BoxFit.scaleDown,
                    ),
                  ),
                ],
              ),
              Column(
                children: <Widget>[
                  Container(
                      alignment: Alignment.topLeft,
                      margin: EdgeInsets.only(top: 20),
                      child: Text(
                        'Create new account',
                        style: MyStyleText.white20Medium,
                      )),
                  Container(
                    alignment: Alignment.topLeft,
                    margin: EdgeInsets.only(top: 5),
                    child: Text(
                      'Use your work email to create new account... its free.',
                      style: MyStyleText.hintColor14Medium,
                    ),
                  ),
                  Container(
                    child: Column(
                      children: <Widget>[
                        Form(
                          child: CommonTextFormField(
                            labelText: 'First Name',
                            focusNode: focusFirstName,
                            fieldKey: _firstnameFieldKey,
                            onTap: () {
                              _firstnameFieldKey.currentState.validate();
                            },
                            onSaved: (String value) {
                              _fristname = value;
                            },
                            onChange: (value) {
                              _fristname = value;
                              _firstnameFieldKey.currentState.didChange(value);
                              _firstnameFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String value) {
                              _firstnameFieldKey.currentState.validate();
                              FocusScope.of(context)
                                  .requestFocus(focusLastName);
                            },
                            validator: (String value) {
                              if (value.isEmpty) {
                                return 'First name is required';
                              }
                              return null;
                            },
                          ),
                        ),
                        Form(
                          child: CommonTextFormField(
                            labelText: 'Last Name',
                            focusNode: focusLastName,
                            fieldKey: _lastnameFieldKey,
                            onTap: () {
                              _lastnameFieldKey.currentState.validate();
                            },
                            onSaved: (String value) {
                              _lastname = value;
                            },
                            onChange: (value) {
                              _lastname = value;
                              _lastnameFieldKey.currentState.didChange(value);
                              _lastnameFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String value) {
                              _lastnameFieldKey.currentState.validate();
                              FocusScope.of(context)
                                  .requestFocus(focusLoginName);
                            },
                            validator: (String value) {
                              if (value.isEmpty) {
                                return 'Last name is required';
                              }
                              return null;
                            },
                          ),
                        ),
                        Form(
                          child: CommonTextFormField(
                            labelText: 'Login Name',
                            focusNode: focusLoginName,
                            fieldKey: _loginnameFieldKey,
                            onTap: () {
                              _loginnameFieldKey.currentState.validate();
                            },
                            onSaved: (String value) {
                              _loginname = value;
                            },
                            onChange: (value) {
                              _loginname = value;
                              _loginnameFieldKey.currentState.didChange(value);
                              _loginnameFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String value) {
                              _loginnameFieldKey.currentState.validate();
                              FocusScope.of(context).requestFocus(focusEmail);
                            },
                            validator: (String value) {
                              if (value.isEmpty && value.length < 8) {
                                return 'Login name is required';
                              }
                              return null;
                            },
                          ),
                        ),
                        Form(
                          child: CommonTextFormField(
                            labelText: 'Email Address',
                            fieldKey: _emailaddressFieldKey,
                            focusNode: focusEmail,
                            onTap: () {
                              _emailaddressFieldKey.currentState.validate();
                            },
                            onSaved: (String value) {
                              _email = value;
                            },
                            onChange: (value) {
                              _email = value;
                              _emailaddressFieldKey.currentState
                                  .didChange(value);
                              _emailaddressFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String value) {
                              _emailaddressFieldKey.currentState.validate();
                              FocusScope.of(context)
                                  .requestFocus(focusPassword);
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
                        Form(
                          child: CommonTextFormField(
                            fieldKey: _passwordFieldKey,
                            hintText: 'Password',
                            focusNode: focusPassword,
                            obscureText: _obscureText,
                            suffixIcon: new GestureDetector(
                              onTap: () {
                                setState(() {
                                  _obscureText = !_obscureText;
                                });
                              },
                              child: Icon(
                                _obscureText
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: Colors.white,
                              ),
                            ),
                            onSaved: (String value) {
                              _passwordSignUp = value;
                            },
                            onFieldSubmitted: (String value) {
                              _passwordFieldKey.currentState.validate();
                              FocusScope.of(context)
                                  .requestFocus(focusComfirmPassword);
                            },
                            onChange: (value) {
                              _passwordSignUp = value;
                              _passwordFieldKey.currentState.didChange(value);
                              _passwordFieldKey.currentState.validate();
                            },
                            validator: (String value) {
                              Pattern pattern =
                                  r'^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$';
                              RegExp regexPassword = new RegExp(pattern);
                              if (value.isEmpty) {
                                return 'Password is required ';
                              } else {
                                if (regexPassword.hasMatch(value)) {
                                  return 'Passwords is 8 letters and more characters with a mix of letters, number & symbols';
                                } else
                                  return null;
                              }
                            },
                          ),
                        ),
                        Form(
                          child: CommonTextFormField(
                            fieldKey: _passwordComfirmFieldKey,
                            hintText: 'Confirm Password',
                            focusNode: focusComfirmPassword,
                            suffixIcon: new GestureDetector(
                              onTap: () {
                                setState(() {
                                  _obscureText = !_obscureText;
                                });
                              },
                              child: Icon(
                                _obscureText
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: Colors.white,
                              ),
                            ),
                            onSaved: (String valueCP) {
                              return _comfirmpasswordSignUp = valueCP;
                            },
                            onChange: (valueCP) {
                              _comfirmpasswordSignUp = valueCP;
                                    _passwordComfirmFieldKey.currentState.didChange(valueCP);
                              _passwordComfirmFieldKey.currentState.validate();
                            },
                            onFieldSubmitted: (String valueCP) {
                              _passwordComfirmFieldKey.currentState.validate();
                            },
                            validator: (valueCP) {
                              Pattern pattern =
                                  r'^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$';
                              RegExp regexCPassword = new RegExp(pattern);
                              if (valueCP.isEmpty) {
                                return 'Passwords do not match';
                              } else {
                                if (regexCPassword.hasMatch(valueCP) &&
                                    _comfirmpasswordSignUp != _passwordSignUp) {
                                  return 'Passwords do not match';
                                } else
                                  return null;
                              }
                            },
                          ),
                        ),
                        Container(
                            padding: const EdgeInsets.symmetric(vertical: 16.0),
                            margin: EdgeInsets.only(top: 10),
                            alignment: Alignment.topLeft,
                            child: Text(
                              'Use 8 or more characters with a mix of letters, numbers & symbols',
                              style: MyStyleText.hintColor12Medium,
                            )),
                        Container(
                          margin: EdgeInsets.only(top: 24, left: 140),
                          width: 135,
                          height: 40,
                          child: CommonButton(
                              borderColor: MyColors.blueColor,
                              bgColor: MyColors.blueColor,
                              title: 'NEXT',
                              titleStyle: MyStyleText.white14Bold,
                              onTap: () {
                                SignupRequest signupRequest = new SignupRequest(
                                  firstName: _fristname,
                                  lastName: _lastname,
                                  loginName: _loginname,
                                  email: _email,
                                  password: _passwordSignUp,
                                );
                                if (signupRequest.firstName != "" &&
                                    signupRequest.lastName != "" &&
                                    signupRequest.email != "" &&
                                    signupRequest.loginName != "" &&
                                    signupRequest.password != "") {
                                  Navigator.of(context).pushNamed(
                                      RoutesName.PROFILE_SCREEN,
                                      arguments: signupRequest);
                                }
                              }),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 40, bottom: 20),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: <Widget>[
                              Text(
                                ' Have an account?',
                                style: MyStyleText.hintColor14Medium,
                              ),
                              Container(
                                width: 8,
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context)
                                      .pushNamed(RoutesName.LOGIN_SCREEN);
                                },
                                child: Text(
                                  'Sign In',
                                  style: MyStyleText.textLink16Bold,
                                ),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ]),
          ),
        ),
      ),
    );
  }
}

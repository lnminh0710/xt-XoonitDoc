import 'package:flutter/material.dart';
import 'package:googleapis/cloudtrace/v2.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';

class FormChangePassword extends StatefulWidget {
  FormChangePassword({
    Key key,
    this.onCurrentPasswordChange,
    this.onNewPasswordChange,
    this.onRepeatPasswordChange,
    this.validateRepeatPW,
    this.validatorRepeatPassWord,
    this.repeatPWFocusNode,
  }) : super(key: key);
  final Function(String) onCurrentPasswordChange;
  final Function(String) onNewPasswordChange;
  final Function(String) onRepeatPasswordChange;
  final bool validateRepeatPW;
  final String Function(String) validatorRepeatPassWord;
  final FocusNode repeatPWFocusNode;
  @override
  _FormChangePasswordState createState() => _FormChangePasswordState();
}

class _FormChangePasswordState extends State<FormChangePassword> {
  final _oldPasswordFieldKey = GlobalKey<FormFieldState<String>>();
  final _newPasswordFieldKey = GlobalKey<FormFieldState<String>>();
  final _repeatPasswordFieldKey = GlobalKey<FormFieldState<String>>();
  bool _obsOldPassword = true;
  bool _obsNewPassword = true;
  bool _obsRpPassword = true;
  FocusNode _oldPWFocusNode = FocusNode();
  FocusNode _newPWFocusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: <Widget>[
          Container(
            height: 80,
            child: CommonTextFormField(
              labelText: "Current Password",
              fieldKey: _oldPasswordFieldKey,
              focusNode: _oldPWFocusNode,
              obscureText: _obsOldPassword,
              onChange: widget.onCurrentPasswordChange,
              suffixIcon: new GestureDetector(
                onTap: () {
                  setState(() {
                    _oldPWFocusNode.unfocus();
                    _obsOldPassword = !_obsOldPassword;
                  });
                },
                child: Icon(
                  _obsOldPassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.grey,
                ),
              ),
            ),
          ),
          Container(
            height: 80,
            child: CommonTextFormField(
              labelText: "New Password",
              fieldKey: _newPasswordFieldKey,
              focusNode: _newPWFocusNode,
              obscureText: _obsNewPassword,
              autovalidate: true,
              validator: validator,
              onChange: widget.onNewPasswordChange,
              suffixIcon: new GestureDetector(
                onTap: () {
                  setState(() {
                    _newPWFocusNode.unfocus();
                    _obsNewPassword = !_obsNewPassword;
                  });
                },
                child: Icon(
                  _obsNewPassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.grey,
                ),
              ),
            ),
          ),
          Container(
            height: 80,
            child: CommonTextFormField(
              labelText: "Repeat Password",
              fieldKey: _repeatPasswordFieldKey,
              focusNode: widget.repeatPWFocusNode,
              obscureText: _obsRpPassword,
              autovalidate: widget.validateRepeatPW,
              validator: widget.validatorRepeatPassWord,
              onChange: widget.onRepeatPasswordChange,
              suffixIcon: new GestureDetector(
                onTap: () {
                  setState(() {
                    widget.repeatPWFocusNode.unfocus();
                    _obsRpPassword = !_obsRpPassword;
                  });
                },
                child: Icon(
                  _obsRpPassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.grey,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String validator(String value) {
    Pattern pattern = r'^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$';
    RegExp regexPassword = new RegExp(pattern);
    if (regexPassword.hasMatch(value)) {
      return 'Passwords is 9 letters and more characters \nwith a mix of letters, number & symbols';
    } else
      return null;
  }
}

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/profiles/edit_password/edit_password_bloc.dart';

import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import 'build_form_change_password.dart';

class ChangePasswordScreen extends StatefulWidget {
  ChangePasswordScreen({Key key}) : super(key: key);

  @override
  _ChangePasswordScreenState createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  String _currentPassword = '', _newPassword = '', _repeatPassword = '';
  FocusNode _repeatPWFocusNode = FocusNode();
  @override
  Widget build(BuildContext context) {
    EditPasswordBloc editPasswordBloc = BlocProvider.of(context);
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        elevation: 1.0,
        leading: IconButton(
            icon: Icon(Icons.arrow_back_ios, size: 18),
            onPressed: () {
              Navigator.of(context).pop();
            }),
        title: Text(
          "Change Password",
          style: MyStyleText.blueDarkColor16Medium,
        ),
        centerTitle: true,
      ),
      body: Container(
        padding: EdgeInsets.all(32.0),
        child: Stack(
          children: <Widget>[
            SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  SizedBox(height: 4),
                  FormChangePassword(
                    onCurrentPasswordChange: (currentPw) {
                      _currentPassword = currentPw;
                    },
                    onNewPasswordChange: (newPassword) {
                      setState(() {
                        _newPassword = newPassword;
                      });
                    },
                    onRepeatPasswordChange: (repeatPassword) {
                      setState(() {
                        _repeatPassword = repeatPassword;
                      });
                    },
                    validateRepeatPW: true,
                    repeatPWFocusNode: _repeatPWFocusNode,
                    validatorRepeatPassWord: (value) {
                      Pattern pattern = _newPassword;
                      RegExp regexPassword = new RegExp(pattern);
                      if (!regexPassword.hasMatch(value) &&
                          _newPassword != '' &&
                          _repeatPWFocusNode.hasFocus) {
                        return 'Repeat password is not match';
                      } else
                        return null;
                    },
                  ),
                  _buildListRules(),
                ],
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                width: Dimension.getWidth(1),
                child: RaisedButton(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                  ),
                  color: MyColors.orangeColor,
                  child: Text(
                    "SAVE",
                    style: MyStyleText.white16Medium,
                  ),
                  onPressed: () {
                    editPasswordBloc
                        .saveChangePassword(context, _currentPassword,
                            _newPassword, _repeatPassword)
                        .then((value) {
                      if (value is bool && value == true) {
                        showDialog(
                            context: context,
                            builder: (_context) {
                              return NotificationDialog(
                                  iconImages:
                                      Image.asset(Resources.icDialogWarning),
                                  title: "Notice !",
                                  message: "Change password sucessfully",
                                  possitiveButtonName: "OK",
                                  possitiveButtonOnClick: (_) {
                                    Navigator.of(_context).pop();
                                  });
                            }).then((value) => Navigator.of(context).pop());
                      }
                    });
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListRules() => Container(
        margin: EdgeInsets.only(top: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            _buildItemRules("Password must be minimum 9 characters"),
            _buildItemRules(
                "Password must contain a mix of uppercase and lowercase characters (A, z)"),
            _buildItemRules("Password must contain numeric character (0-9)"),
            _buildItemRules(
                "Password must contain special characters (eg: !@#\$\%^&* )"),
          ],
        ),
      );

  Widget _buildItemRules(String textRules) => Container(
        margin: EdgeInsets.symmetric(vertical: 2),
        child: Row(children: <Widget>[
          Expanded(
            flex: 1,
            child: Center(
              child: Container(
                width: 5,
                height: 5,
                decoration: ShapeDecoration(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(
                        Radius.circular(5),
                      ),
                    ),
                    color: MyColors.blueDarkText),
              ),
            ),
          ),
          Expanded(
            flex: 9,
            child: Text(
              textRules,
              maxLines: 3,
              softWrap: true,
              overflow: TextOverflow.visible,
              style: MyStyleText.blue12Regular,
            ),
          ),
        ]),
      );
}

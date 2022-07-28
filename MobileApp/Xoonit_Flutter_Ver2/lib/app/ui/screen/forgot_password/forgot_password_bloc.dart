import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/model/forgot_password_request.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:flutter/material.dart';

import '../../../difinition.dart';

class ForgotPasswordBloc extends BlocBase {
  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;
  @override
  void dispose() {
    _screenState?.close();
  }

  void showMessageDialog(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Success!',
            message:
                'Email is sent successfully!\nPlease check your email and change password.',
            onOKButtonPressed: () {
              Navigator.of(context).pushNamed(RoutesName.LOGIN_SCREEN);
            },
          );
        });
  }

  void postforgotPassword(ForgotPasswordRequest fogotPasswordRequest,
      BuildContext buildContext) async {
    _screenState.sink.add(AppState.Loading);
    appApiService.client
        .forgotPassword(fogotPasswordRequest.toJson())
        .then((onValue) {
      String accessToken = onValue?.item?.accessToken;
      if (accessToken != null && accessToken != '') {
        showMessageDialog(buildContext);
      } else {
        showDialog(
            context: buildContext,
            builder: (BuildContext context) {
              return DialogMessage(
                title: 'Failed!',
                message: 'Account does not exist!',
                onOKButtonPressed: () {
                  Navigator.of(context).pop();
                },
              );
            });
      }
      _screenState.sink.add(AppState.Idle);
    });
  }
}

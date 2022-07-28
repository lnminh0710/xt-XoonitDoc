import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/model/login_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../../core/bloc_base.dart';
import '../../../difinition.dart';

class LoginBloc extends BlocBase {
  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  final BehaviorSubject<bool> _isRemember = BehaviorSubject<bool>.seeded(false);
  Stream<bool> get isRemember => _isRemember.stream;

  @override
  void dispose() {
    _screenState?.close();
    _isRemember?.close();
  }

  LoginBloc();

  void setRemeberValue(bool value) {
    _isRemember.sink.add(value);
  }

  String changeBuildFavor() {
    buildFlavor = buildFlavor == BuildFlavor.development
        ? BuildFlavor.production
        : BuildFlavor.development;

    GeneralMethod.saveBuildFavor(buildFlavor);
    return "${buildFlavor.name}";
  }

  void showLoginFailDialog(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return DialogMessage(
            title: 'Login Faiiled',
            message: 'Your email or password is incorrect!',
            onOKButtonPressed: () {
              GeneralMethod.clearUserData();
              Navigator.of(context).pop();
            },
          );
        });
  }

  Future<void> callLoginApi(
      LoginRequest loginRequest, BuildContext context, bool isRemember) async {
    _screenState.sink.add(AppState.Loading);
    // loginRequest.idRepLanguage = 'TEST_TOKEN'; just for test refresh token handle 401
    await appApiService.client.login(loginRequest.toJson()).then((onValue) {
      String accessToken = onValue?.item?.accessToken;
      if (accessToken != null && accessToken != '') {
          AppStateBloc.sharePref
              .setBool(ConstantValues.isRememberAccount, isRemember);
        GeneralMethod.saveUserInfo(
            accessToken, onValue?.item?.refreshToken, onValue?.item?.expiresIn);

        Navigator.of(context).pushNamedAndRemoveUntil(
            RoutesName.HOME_SCREEN, (Route<dynamic> route) => false);
      } else {
        showLoginFailDialog(context);
      }
      _screenState.sink.add(AppState.Idle);
    }).catchError((onError) {
      showLoginFailDialog(context);
      _screenState.sink.add(AppState.Idle);
    });
  }
}

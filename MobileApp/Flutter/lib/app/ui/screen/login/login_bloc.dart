import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:rxdart/rxdart.dart';
import 'package:toast/toast.dart';
import 'package:xoonit/app/model/login_request.dart';
import 'package:xoonit/app/model/user_info.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/app/utils/general_method.dart';

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

  void callLoginApi(
      LoginRequest loginRequest, BuildContext context, bool isRemember) {
    _screenState.sink.add(AppState.Loading);
    appApiService.client.login(loginRequest.toJson()).then((onValue) {
      _screenState.sink.add(AppState.Idle);
      String accessToken = onValue?.item?.accessToken;
      if (accessToken != null && accessToken != '') {
        int timeToRefresh = DateTime.now().millisecondsSinceEpoch +
            int.parse(onValue?.item?.expiresIn);
        var tokenParse = Jwt.parseJwt(accessToken);
        var appInfor = json.decode(tokenParse['appinfo']);
        String userID, userNickName;
        if (appInfor != null) {
          userID = appInfor['UserGuid'].toString() ?? '';
          userNickName = appInfor['NickName'].toString() ?? '';
        }
        UserInfo userInfo = UserInfo(
            accessToken: accessToken,
            refreshToken: onValue?.item?.refreshToken,
            nickName: userNickName,
            userID: userID,
            userName: loginRequest.loginName,
            expiresIn: timeToRefresh);
        XoonitApplication.instance.setUserInfor(userInfo);
        if (isRemember) {
          GeneralMethod.saveUserData(userInfo);
        }
        Navigator.of(context).pushNamedAndRemoveUntil(
            RoutesName.HOME_SCREEN, (Route<dynamic> route) => false);
      } else {
        Toast.show('Login failed!', context);
      }
      _screenState.sink.add(AppState.Idle);
    });
  }
}

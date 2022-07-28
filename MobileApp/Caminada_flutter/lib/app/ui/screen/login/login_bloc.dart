import 'dart:convert';

import 'package:caminada/app/constants/constants_value.dart';
import 'package:caminada/app/ui/dialog/dialog_message.dart';
import 'package:caminada/app/utils/database/database_manager.dart';
import 'package:caminada/config.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:rxdart/rxdart.dart';
import 'package:toast/toast.dart';
import 'package:caminada/app/model/login_request.dart';
import 'package:caminada/app/model/user_info.dart';
import 'package:caminada/app/routes/routes.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:caminada/app/utils/general_method.dart';

import '../../../../core/bloc_base.dart';
import '../../../difinition.dart';

class LoginBloc extends BlocBase {
  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  final BehaviorSubject<bool> _isRemember = BehaviorSubject<bool>.seeded(false);
  Stream<bool> get isRememberStream => _isRemember.stream;
  bool get isRemember => _isRemember.value;

  @override
  void dispose() {
    _screenState?.close();
    _isRemember?.close();
  }

  LoginBloc();

  void setRemeberValue(bool value) {
    _isRemember.sink.add(value);
  }

  Future<String> changeBuildFavor() async {
    buildFlavor = buildFlavor == BuildFlavor.development
        ? BuildFlavor.production
        : BuildFlavor.development;
    await setupEnv(buildFlavor);
    appApiService.create();
    GeneralMethod.saveBuildFavor(buildFlavor);
    return "${buildFlavor.name}";
  }

  void callLoginApi(
      LoginRequest loginRequest, BuildContext context, bool isRemember) async {
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
        String encryptedKey;
        if (appInfor != null) {
          userID = appInfor['UserGuid'].toString() ?? '';
          userNickName = appInfor['NickName'].toString() ?? '';
          encryptedKey = appInfor['Encrypted'].toString() ?? '';
        }

        if (loginRequest.email !=
            CaminadaApplication.getSharePref()
                .getString(ConstantValues.userEmail)) {
          DatabaseManager.clearData();
          CaminadaApplication.getSharePref()
              .setString(ConstantValues.userEmail, loginRequest.email);
        }

        UserInfo userInfo = UserInfo(
            accessToken: accessToken,
            refreshToken: onValue?.item?.refreshToken,
            nickName: userNickName,
            userID: userID,
            email: loginRequest.email,
            expiresIn: timeToRefresh,
            idLoginRoles: GeneralMethod.getLoginRoles(encryptedKey));
        CaminadaApplication.instance.setUserInfor(userInfo);

        if (isRemember) {
          GeneralMethod.saveUserData(userInfo);
        }

        GeneralMethod.getDocumentTree().then((value) {
          if (CaminadaApplication.instance.documentTreeItemList.length > 0) {
            Navigator.of(context).pushReplacementNamed(RoutesName.SCAN);
          } else {
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return DialogMessage(
                    title: 'Message',
                    message: 'Login failed!',
                    onOKButtonPressed: () {
                      GeneralMethod.clearUserData();
                      Navigator.of(context).pop();
                    },
                  );
                });
          }
        });
      } else {
        Toast.show('Login failed!', context);
      }
      _screenState.sink.add(AppState.Idle);
    }).catchError((onError) {
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return DialogMessage(
              title: 'Login Failed',
              message: 'Your email or password is incorrect!',
              onOKButtonPressed: () {
                GeneralMethod.clearUserData();
                Navigator.of(context).pop();
              },
            );
          });
      _screenState.sink.add(AppState.Idle);
    });
  }
}

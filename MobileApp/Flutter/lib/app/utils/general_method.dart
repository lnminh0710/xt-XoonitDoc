import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/app/model/login_response.dart';
import 'package:xoonit/app/model/remote/contact_communication.dart';
import 'package:xoonit/app/model/user_info.dart';
import 'package:xoonit/app/ui/dialog/dialog_review_image.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';

class GeneralMethod {
  static void saveUserData(UserInfo userInfo) {
    AppStateBloc.sharePref
        .setString(ConstantValues.accessToken, userInfo?.accessToken);
    AppStateBloc.sharePref
        .setString(ConstantValues.refreshToken, userInfo?.refreshToken);
    AppStateBloc.sharePref
        .setInt(ConstantValues.timeToRefresh, userInfo?.expiresIn);
    AppStateBloc.sharePref.setString(ConstantValues.userID, userInfo?.userID);
    AppStateBloc.sharePref
        .setString(ConstantValues.userNickName, userInfo?.nickName);
    AppStateBloc.sharePref
        .setString(ConstantValues.userName, userInfo?.userName);
  }

  static saveBuildFavor(BuildFlavor mode) {
    AppStateBloc.sharePref.setString(ConstantValues.buildFavorMode, mode.name);
  }

  static void clearUserData() {
    AppStateBloc.sharePref.setString(ConstantValues.accessToken, '');
    AppStateBloc.sharePref.setString(ConstantValues.refreshToken, '');
    AppStateBloc.sharePref.setInt(ConstantValues.timeToRefresh, 0);
    AppStateBloc.sharePref.setString(ConstantValues.userID, '');
    AppStateBloc.sharePref.setString(ConstantValues.userNickName, '');
    AppStateBloc.sharePref.setString(ConstantValues.userName, '');
    AppStateBloc.sharePref.setString(ConstantValues.buildFavorMode, '');
    XoonitApplication.instance.setUserInfor(UserInfo());
  }

  static bool shouldRefreshToken() {
    String refreshToken = XoonitApplication.instance.userInfo.refreshToken;
    int timeToRefresh = XoonitApplication.instance.userInfo.expiresIn;
    if (refreshToken != null && refreshToken != '') {
      return timeToRefresh > 0 &&
          DateTime.now().millisecondsSinceEpoch / 1000 >= timeToRefresh;
    }

    return false;
  }

  static Future<LoginResponse> refreshToken(String refreshToken) async {
    GeneralMethod.clearUserData();
    printLog(refreshToken);
    Dio _dio = Dio();
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/authenticate/refreshtoken',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{
              "Authorization": "Bearer " + refreshToken
            },
            extra: _extra,
            baseUrl: appBaseUrl),
        data: _data);
    // json.decode(_result.data);
    final onValue = LoginResponse.fromJson(_result.data);
    if (onValue != null) {
      String accessToken = onValue?.item?.accessToken;
      if (accessToken != null && accessToken != '') {
        int timeToRefresh = DateTime.now().millisecondsSinceEpoch +
            int.parse(onValue?.item?.expiresIn);
        var tokenParse = Jwt.parseJwt(accessToken);
        var appInfor = json.decode(tokenParse['appinfo']);
        String userID, userNickName,userEmail;
        if (appInfor != null) {
          userID = appInfor['UserGuid'].toString() ?? '';
          userNickName = appInfor['NickName'].toString() ?? '';
          userEmail = appInfor['Email'].toString() ?? '';
        }
        UserInfo userInfo = UserInfo(
            accessToken: accessToken,
            refreshToken: onValue?.item?.refreshToken,
            nickName: userNickName,
            userID: userID,
            email: userEmail,
            // userName: loginRequest.loginName,
            expiresIn: timeToRefresh);
        XoonitApplication.instance.setUserInfor(userInfo);
        String currentAccessToken =
            AppStateBloc.sharePref.getString(ConstantValues.accessToken);
        if (currentAccessToken != null && currentAccessToken != '') {
          GeneralMethod.saveUserData(userInfo);
        }
      }
    }
    return onValue;
  }

  static String getCommunicateContactDetails(Contact contact, String valueTag) {
    String communication = "";
    String value = "";
    List<Communication> communications = new List();
    if (contact.communication != null) {
      communication = contact.communication;
      communications = communicationFromJson(communication);
      printLog(communications);
    }
    communications.forEach((element) {
      if (element.defaultValue != null && element.commValue1 != null) {
        switch (element.defaultValue) {
          case "Phone":
            value = element.commValue1;
            break;
          case "E-Mails":
            value = element.commValue1;
            break;
          case "Internet":
            value = element.commValue1;
            break;
        }
      }
    });
    return value;
  }

  static String getImageURL(String localPath, String localName) {
    return appBaseUrl +
        "FileManager/GetFile?mode=6&name=" +
        localPath +
        "\\" +
        localName;
  }
  static String getDownloadURL(String idDocumentContainerScans){
    return appBaseUrl + "DocumentContainer/GetFile?IdDocumentContainerScans="+idDocumentContainerScans;
  }

  static void reviewDocument(
      BuildContext context, String idDocumentContainerScans) async {
    await appApiService.client
        .getDocumentPagesById(idDocumentContainerScans)
        .then((value) {
      List<String> listURL = new List();
      List<String> listName = new List();
      if (value != null && value.length > 0) {
        value.forEach((item) {
          listURL
              .add(GeneralMethod.getImageURL(item.scannedPath, item.fileName));
          listName.add(item.fileName);
        });
       
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return ReviewImageDialog(
              isLocalImage: false,
              listDocumentURL: listURL,
              listDocumentName: listName,
            );
          },
        ).then((value) {
          SystemChrome.setEnabledSystemUIOverlays([]);
        });
      }
    });
  }
}

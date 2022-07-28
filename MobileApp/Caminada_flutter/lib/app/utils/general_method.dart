import 'dart:convert';

import 'package:caminada/app/model/local/document/document_dao.dart';
import 'package:caminada/app/model/local/document/document_table.dart';
import 'package:caminada/app/model/scan_result.dart';
import 'package:caminada/app/utils/specific_method.dart';
import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:caminada/app/app_state_bloc.dart';
import 'package:caminada/app/constants/constants_value.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/contact_response.dart';
import 'package:caminada/app/model/login_response.dart';
import 'package:caminada/app/model/remote/contact_communication.dart';
import 'package:caminada/app/model/user_info.dart';
import 'package:caminada/app/ui/dialog/dialog_review_image.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:uuid/uuid.dart';

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
    AppStateBloc.sharePref.setString(ConstantValues.userEmail, userInfo?.email);
    AppStateBloc.sharePref.setString(
        ConstantValues.idLoginRoles, userInfo?.idLoginRoles?.getloginRoles);
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
    // AppStateBloc.sharePref.setString(ConstantValues.userEmail, '');
    // AppStateBloc.sharePref.setString(ConstantValues.buildFavorMode, '');
    AppStateBloc.sharePref.setString(ConstantValues.idLoginRoles, '');
    CaminadaApplication.instance.setUserInfor(UserInfo());
  }

  static bool shouldRefreshToken() {
    String refreshToken = CaminadaApplication.instance.userInfo.refreshToken;
    int timeToRefresh = CaminadaApplication.instance.userInfo.expiresIn;
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
        String userID, userNickName, encryptedKey;
        if (appInfor != null) {
          userID = appInfor['UserGuid'].toString() ?? '';
          userNickName = appInfor['NickName'].toString() ?? '';
          encryptedKey = appInfor['Encrypted'].toString() ?? '';
        }
        UserInfo userInfo = UserInfo(
            accessToken: accessToken,
            refreshToken: onValue?.item?.refreshToken,
            nickName: userNickName,
            userID: userID,
            // userName: loginRequest.loginName,
            expiresIn: timeToRefresh,
            idLoginRoles: getLoginRoles(encryptedKey));
        CaminadaApplication.instance.setUserInfor(userInfo);
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

  static Future<void> getDocumentTree() async {
    await appApiService.client.getDocumentTree().then((onValue) {
      if (onValue != null && onValue?.item != null)
        CaminadaApplication.instance.setDocumentTreeList(onValue.item);
    }).catchError((onError) {
      return null;
    });
  }

  static Future<List<String>> openCamera() async {
    List<String> scanResults = await SpecificMethod.showScanScreen();
    GeneralMethod.handleScanImages(scanResults);
    return scanResults;
  }

  static handleScanImages(List<String> value) {
    printLog('IMAGE PATH: ' + value.toString() ?? '');
    value.forEach((scanResultJsonString) {
      _saveDocumentToLocal(scanResultJsonString);
    });
  }

  static DateTime onConvertStringtoDateTimr(String strDateTime) {
    DateFormat createDateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss.sss');
    return createDateFormat.parse(strDateTime);
  }

  static void _saveDocumentToLocal(String scanResultJsonString) {
    if (scanResultJsonString != null && scanResultJsonString != '') {
      ScanResult scanResult = scanResultFromJson(scanResultJsonString);
      if (scanResult != null) {
        List<String> imagePathSplit = scanResult.imgPath.split('/');
        String imageName = imagePathSplit.last;
        String path = scanResult.imgPath
            .substring(0, scanResult.imgPath.lastIndexOf('/'));
        final dateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss.sss');
        final dateFormatInImage = new DateFormat('MM-dd-yyyy HH:mm:ss');
        String createDate = dateFormat.format(new DateTime.now());
        String timeUTC = dateFormat.format(DateTime.now().toUtc());

        var dateTime = DateTime.now();
        TDocument document = TDocument(
            uuid: Uuid().v4(),
            imagePath: scanResult.imgPath,
            lotName: '-LOT-$createDate' +
                '-Mobile-${ConstantValues.defaultUserCompany}' +
                '-${CaminadaApplication.instance.getUserInfor().userName ?? ''}',
            name: imageName,
            createDate: createDate,
            dateInImage: dateFormatInImage.format(dateTime),
            docTreeName: CaminadaApplication.instance
                .getDocumentTreeNameById(scanResult.idDocumentTree),
            docTreeId: scanResult.idDocumentTree,
            clientOpenDateUTC: timeUTC);
        DocumentDAO.insert(document);
      }
    }
  }

  static IdLoginRoles getLoginRoles(String encryptedKey) {
    switch (encryptedKey) {
      case "4DFF4EA340F0A823F15D3F4F01AB62EAE0E5DA579CCB851F8DB9DFE84C58B2B37B89903A740E1EE172DA793A6E79D560E5F7F9BD058A12A280433ED6FA46510A": // id =1
        return IdLoginRoles.MainAdministrator;
        break;
      case "40B244112641DD78DD4F93B6C9190DD46E0099194D5A44257B7EFAD6EF9FF4683DA1EDA0244448CB343AA688F5D3EFD7314DAFE580AC0BCBF115AECA9E8DC114": // id =2
        return IdLoginRoles.Administrator;
        break;
      default:
        return IdLoginRoles.User;
    }
  }
}

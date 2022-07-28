import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/local/document/document_dao.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/model/login_response.dart';
import 'package:xoonit/app/model/remote/contact_communication.dart';
import 'package:xoonit/app/model/remote/global_search/column_search_settings.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/model/user_info.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/dialog/dialog_review_image.dart';
import 'package:xoonit/app/utils/specific_method.dart';
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
    AppStateBloc.sharePref.setString(
        ConstantValues.idApplicationOwner, userInfo?.idApplicationOwner);
    AppStateBloc.sharePref.setString(
        ConstantValues.idCloudConnection, userInfo?.idCloudConnection);
    AppStateBloc.sharePref.setString(ConstantValues.idLogin, userInfo?.idLogin);
    AppStateBloc.sharePref
        .setString(ConstantValues.idRepLanguage, userInfo?.idRepLanguage);
    AppStateBloc.sharePref
        .setString(ConstantValues.avatarUrl, userInfo?.avatarUrl);
    AppStateBloc.sharePref
        .setString(ConstantValues.firstName, userInfo?.firstName);
    AppStateBloc.sharePref
        .setString(ConstantValues.lastName, userInfo?.lastName);
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
    AppStateBloc.sharePref.setString(ConstantValues.idApplicationOwner, '');
    AppStateBloc.sharePref.setString(ConstantValues.idCloudConnection, '');
    AppStateBloc.sharePref.setString(ConstantValues.idLogin, '');
    AppStateBloc.sharePref.setString(ConstantValues.idRepLanguage, '');
    AppStateBloc.sharePref.setString(ConstantValues.avatarUrl, '');
    AppStateBloc.sharePref.setString(ConstantValues.firstName, '');
    AppStateBloc.sharePref.setString(ConstantValues.lastName, '');

    XoonitApplication.instance.setUserInfor(UserInfo());
  }

  static void saveUserInfo(
      String accessToken, String refreshToken, String expiresIn) {
    int timeToRefresh =
        DateTime.now().millisecondsSinceEpoch + int.parse(expiresIn) * 1000;
    var tokenParse = Jwt.parseJwt(accessToken);
    var appInfor = json.decode(tokenParse['appinfo']);
    String userID,
        userEmail,
        userNickName,
        idApplicationOwner,
        idCloudConnection,
        idLogin,
        idRepLanguage,
        avatarUrl,
        firstName,
        lastName;
    if (appInfor != null) {
      userID = appInfor['UserGuid'].toString() ?? '';
      userNickName = appInfor['NickName'].toString() ?? '';
      userEmail = appInfor['Email'].toString() ?? '';
      idApplicationOwner = appInfor['IdApplicationOwner'].toString() ?? '';
      idCloudConnection = appInfor['IdCloudConnection'].toString() ?? '';
      idLogin = appInfor['IdLogin'].toString() ?? '';
      idRepLanguage = appInfor['IdRepLanguage'].toString() ?? '';
      avatarUrl = appInfor['AvatarUrl'] ?? '';
      firstName = appInfor['FirstName'].toString() ?? '';
      lastName = appInfor['LastName'].toString() ?? '';
    }
    UserInfo userInfo = UserInfo(
        accessToken: accessToken,
        refreshToken: refreshToken,
        nickName: userNickName,
        userID: userID,
        email: userEmail,
        idApplicationOwner: idApplicationOwner,
        idCloudConnection: idCloudConnection,
        idLogin: idLogin,
        idRepLanguage: idRepLanguage,
        expiresIn: timeToRefresh,
        avatarUrl: avatarUrl,
        firstName: firstName,
        lastName: lastName);
    XoonitApplication.instance.setUserInfor(userInfo);
    if (AppStateBloc.sharePref.getBool(ConstantValues.isRememberAccount)) {
      GeneralMethod.saveUserData(XoonitApplication.instance.getUserInfor());
    }
  }

  static bool shouldRefreshToken() {
    // return true;
    String refreshToken = XoonitApplication.instance.userInfo.refreshToken;
    int timeToRefresh = XoonitApplication.instance.userInfo.expiresIn;
    if (refreshToken != null && refreshToken != '') {
      return timeToRefresh > 0 &&
          DateTime.now().millisecondsSinceEpoch >= (timeToRefresh - 5*60*1000);
    }

    return false;
  }

  static Future<LoginResponse> refreshToken(String refreshToken) async {
    GeneralMethod.clearUserData();
    printLog("call refresh token " + refreshToken);
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
    printLog("Refresh token response: " + _result.data.toString());
    LoginResponse onValue = LoginResponse.fromJson(_result.data);
    if (onValue != null) {
      String accessToken = onValue?.item?.accessToken;
      if (accessToken != null && accessToken != '') {
        GeneralMethod.saveUserInfo(
            accessToken, onValue?.item?.refreshToken, onValue?.item?.expiresIn);
      }
    }
    return onValue;
  }

  static void showDialogLoading(BuildContext rootContext) {
    showDialog(
      context: rootContext,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(10),
            ),
          ),
          content: Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: CustomLoading(),
          ),
        );
      },
    );
  }

  static String getCommunicateContactDetails(
      ContactSearchResult contact, String valueTag) {
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

  static String getImageURL(String filePath, String fileName, int width) {
    return appBaseUrl +
        "FileManager/GetFile?w=$width&mode=6&name=" +
        filePath +
        "\\" +
        fileName;
  }

  static String getThumbnailURL(String localPath, String localName) {
    return appBaseUrl +
        "FileManager/GetFile?mode=6&w=200&name=" +
        localPath +
        "\\" +
        localName;
  }

  static String getDownloadURL(String idDocumentContainerScans) {
    return appBaseUrl +
        "DocumentContainer/GetFile?IdDocumentContainerScans=" +
        idDocumentContainerScans;
  }

  static void reviewDocument(
      BuildContext context, String idDocumentContainerScans) async {
    await appApiService.client
        .getDocumentPagesByIdDoc(idDocumentContainerScans)
        .then((value) {
      List<String> listURL = new List();
      List<String> listName = new List();
      if (value != null && value.length > 0) {
        value.forEach((item) {
          listURL.add(
              GeneralMethod.getImageURL(item.scannedPath, item.fileName, 600));
          listName.add(item.fileName);
        });
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return ReviewImageDialog(
              isLocalImage: false,
              listDocumentURL: listURL,
              listDocumentName: listName,
              isEditableDocument: false,
            );
          },
        ).then((value) {
          SystemChrome.setEnabledSystemUIOverlays([]);
        });
      }
    });
  }

  static Future<List<String>> openCamera() async {
    List<String> scanResults = await SpecificMethod.showScanScreen();
    handleScanImages(scanResults);
    return scanResults;
  }

  static void handleScanImages(List<String> value) {
    printLog('IMAGE PATH: ' + value.toString() ?? '');
    value.forEach((imagePath) {
      _saveDocumentToLocal(imagePath);
    });
  }

  static bool checkHidenColumn(List<ColumnSetting> settings) {
    if (settings.length == 0) return false;
    if (settings.where((element) {
          return element?.displayField?.hidden == '1';
        }).length >
        0) {
      return true;
    }
    return false;
  }

  static void _saveDocumentToLocal(String imagePath) {
    if (imagePath != null && imagePath != '') {
      List<String> imagePathSplit = imagePath.split('/');
      String imageName = imagePathSplit.last;
      String path = imagePath.substring(0, imagePath.lastIndexOf('/'));
      final dateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss.sss');
      final dateFormatInImage = new DateFormat('MM-dd-yyyy HH:mm:ss');
      String createDate = dateFormat.format(new DateTime.now());
      String timeUTC = dateFormat.format(DateTime.now().toUtc());

      TDocument document = TDocument(
          imagePath: imagePath,
          lotName: '-LOT-${DateTime.now().toString()}' +
              '-Mobile-${ConstantValues.defaultUserCompany}' +
              '-${XoonitApplication.instance.getUserInfor().userName ?? ''}',
          name: imageName,
          createDate: createDate,
          dateInImage: createDate,
          clientOpenDateUTC: timeUTC);
      DocumentDAO.insert(document);
    }
  }
}

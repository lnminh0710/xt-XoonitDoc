import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/cloud/cloud_activies_response.dart';
import 'package:xoonit/app/model/remote/cloud/cloud_connection_response.dart';
import 'package:xoonit/app/model/remote/cloud/save_cloud_connection.dart';
import 'package:xoonit/app/model/remote/cloud/test_connection.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_connection.dart';
import 'package:xoonit/app/utils/cloud_auth.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:googleapis/drive/v3.dart' as drive;

class CloudConnectionBloc extends BlocBase {
  final BehaviorSubject<List<CollectionData>> _lsData =
      BehaviorSubject<List<CollectionData>>.seeded([]);
  Stream<List<CollectionData>> get lsData => _lsData.stream;

  final BehaviorSubject<AppState> _loadingState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get loadingState => _loadingState.stream;

  BehaviorSubject<List<SaveCloudConnection>> _lsCloudState =
      BehaviorSubject.seeded([]);
  Stream<List<SaveCloudConnection>> get lsCloudState => _lsCloudState.stream;

  BehaviorSubject<TestConnectionResponse> _testConnectionResult =
      BehaviorSubject.seeded(null);

  Stream<TestConnectionResponse> get testConnectionResult =>
      _testConnectionResult.stream;

  TestConnectionResponse get connectionResult => _testConnectionResult.value;
  var _lsStateTemp = Map<String, bool>();

  StreamController<bool> backStreamController = StreamController<bool>();

  CloudConnectionBloc() {
    getActives();
  }

  @override
  void dispose() {
    _lsData.close();
    _loadingState.close();
    backStreamController.close();
  }

  getActives() async {
    _loadingState.sink.add(AppState.Loading);
    var response = await appApiService.client.getCloudActives();
    if (response?.item?.collectionData?.isNotEmpty == true) {
      //
      response.item.collectionData.removeWhere((element) => !ECloud.values
          .map((e) => e.value.toLowerCase())
          .toList()
          .contains(element.providerName.value.toLowerCase()));
      //
      _lsData.sink.add(response.item.collectionData.reversed.toList());
    }

    _lsData.value.forEach((e) {
      _lsStateTemp.addAll(
          {e.idCloudProviders.value: e.isActive.value.toLowerCase() == 'true'});
      _lsCloudState.value.add(SaveCloudConnection(
          isActive: e.isActive.value.toLowerCase() == 'true',
          userEmail: e.userName.value,
          idCloudProviders: e.idCloudProviders.value,
          idCloudConnection: e.idCloudConnection.value));
    });

    _lsCloudState.sink.add(_lsCloudState.value);
    _loadingState.sink.add(AppState.Idle);
  }

  Future<CloudConnectionResponse> getConnection(
      dynamic idCloudProviders) async {
    _loadingState.sink.add(AppState.Loading);
    var response =
        await appApiService.client.getCloudConnection(idCloudProviders);

    _lsCloudState.value
        .firstWhere((element) => element.idCloudProviders == idCloudProviders,
            orElse: () => null)
        ?.connectionString = response?.item?.connectionString?.isEmpty ==
            false
        ? CloudConnection.fromJson(jsonDecode(response?.item?.connectionString))
        : null;

    _loadingState.sink.add(AppState.Idle);
    return Future.value(response);
  }

  Future<bool> saveState(String idCloudProviders) async {
    _loadingState.sink.add(AppState.Loading);
    var request = List<Map<String, dynamic>>();
    var cloudActived = _lsCloudState.value
        .firstWhere((element) => element?.isActive == true, orElse: () => null);
    var item = _lsCloudState.value
        .firstWhere((element) => element?.idCloudProviders == idCloudProviders);
    if (cloudActived != null &&
        idCloudProviders != cloudActived?.idCloudProviders) {
      cloudActived?.isActive = false;
      request.add(cloudActived.toJson());
    }

    item?.isActive = !(item?.isActive ?? false);
    item?.idApplicationOwner =
        XoonitApplication.instance.getUserInfor().idApplicationOwner;
    item?.userName = XoonitApplication.instance.getUserInfor().userName;
    item?.clientId = item.clientId ?? "";
    item?.userEmail = item.userEmail ?? "";
    item?.myDmEmail = item.myDmEmail;
    item?.userName = "";
    item?.password = "";

    _lsCloudState.sink.add(_lsCloudState.value);
    request.add(item.toJson());

    var response = await appApiService.client.saveCloudConnection(request);
    _loadingState.sink.add(AppState.Idle);

    //
    if (response?.item?.isSuccess != true) {
      item?.isActive = _lsStateTemp[idCloudProviders];
      if (_lsStateTemp.containsKey(cloudActived?.idCloudProviders ?? ''))
        cloudActived?.isActive = _lsStateTemp[cloudActived.idCloudProviders];
      _lsCloudState.sink.add(_lsCloudState.value);
      return Future.value(false);
    }
    //

    _lsStateTemp.update(idCloudProviders, (value) => item?.isActive ?? false);
    if (_lsStateTemp.containsKey(cloudActived?.idCloudProviders ?? '')) {
      _lsStateTemp.update(cloudActived?.idCloudProviders ?? '',
          (value) => cloudActived?.isActive ?? false);
    }

    backStreamController.sink
        .add(_lsStateTemp.values.any((element) => element));
    if (cloudActived?.idCloudProviders == idCloudProviders && !item.isActive)
      return Future.value(false);

    return Future.value(true);
  }

  Future<bool> saveConnection(
      {String idCloudProviders,
      String userEmail,
      String shareFolder,
      String sharedLink}) async {
    var request = List<Map<String, dynamic>>();
    var item = _lsCloudState.value.firstWhere(
        (element) => element?.idCloudProviders == idCloudProviders,
        orElse: () => null);
    var cloudActived = _lsCloudState.value
        .firstWhere((element) => element?.isActive == true, orElse: () => null);

    if (cloudActived != null &&
        cloudActived?.idCloudProviders != idCloudProviders) {
      cloudActived?.isActive = false;
      request.add(cloudActived?.toJson());
    }

    item?.connectionString = CloudConnection(
      sharedFolder: shareFolder,
      sharedLink: sharedLink,
      userEmail: userEmail,
    );
    item?.isActive = true;
    item?.idApplicationOwner =
        XoonitApplication.instance.getUserInfor().idApplicationOwner;
    item?.userName = XoonitApplication.instance.getUserInfor().userName;
    item?.clientId = item.clientId ?? "";
    item?.userEmail = userEmail.isEmpty ? "" : userEmail;
    item?.myDmEmail = item.myDmEmail;
    item?.userName = "";
    item?.password = "";

    _lsCloudState.sink.add(_lsCloudState.value);
    request.add(item?.toJson());

    var response = await appApiService.client.saveCloudConnection(request);

    if (response?.item?.isSuccess != true) {
      item?.isActive = _lsStateTemp[idCloudProviders];
      if (_lsStateTemp.containsKey(cloudActived?.idCloudProviders ?? ''))
        cloudActived?.isActive = _lsStateTemp[cloudActived.idCloudProviders];
      _lsCloudState.sink.add(_lsCloudState.value);
      return Future.value(false);
    }

    _lsStateTemp.update(idCloudProviders, (value) => true);
    backStreamController.sink
        .add(_lsStateTemp.values.any((element) => element));
    if (_lsStateTemp.containsKey(cloudActived?.idCloudProviders ?? ''))
      _lsStateTemp.update(
          cloudActived?.idCloudProviders ?? '', (value) => false);
    return Future.value(true);
  }

  testConnection(TestConnectionRequest request) async {
    var result =
        await appApiService.client.testCloudConnection(request.toJson());
    _testConnectionResult.sink.add(result);
  }

  resetTestConnection() {
    _testConnectionResult.value = null;
  }

  Future<String> handleGoogleDrive(
      CollectionData data, String xoonitEmail) async {
    try {
      _loadingState.sink.add(AppState.Loading);
      var response = await CloudAuth.googleAuth();
      print(response.toString());
      var value = await GoogleDriveAPI(response).createFolder(xoonitEmail);
      if (value != null) {
        await saveConnection(
            idCloudProviders: data.idCloudProviders.value,
            shareFolder: value.sharedFolder,
            userEmail: value.userEmail);

        _loadingState.sink.add(AppState.Idle);
        return Future.value(
            '${value.sharedFolder} folder has been create in your drive');
      }

      _loadingState.sink.add(AppState.Idle);
      return Future.value('Unable to auto create folder');
    } catch (err) {
      debugPrint(err.toString());
      _loadingState.sink.add(AppState.Idle);
    }
  }

  Future<String> handleOneDrive(CollectionData data, String xoonitEmail) async {
    try {
      _loadingState.sink.add(AppState.Loading);
      var response = await CloudAuth.onedriveAuth();
      var value = await OneDriveAPI(response).createFolder(xoonitEmail);
      if (value != null) {
        await saveConnection(
            idCloudProviders: data.idCloudProviders.value,
            shareFolder: value.sharedFolder,
            userEmail: value.userEmail);

        _loadingState.sink.add(AppState.Idle);
        return Future.value(
            '${value.sharedFolder} folder has been create in your drive');
      }

      _loadingState.sink.add(AppState.Idle);
      return Future.value('Unable to auto create folder');
    } catch (err) {
      debugPrint(err.toString());
      _loadingState.sink.add(AppState.Idle);
    }
  }

  Future<bool> handleActiveCloud(CollectionData data) async {
    _loadingState.sink.add(AppState.Loading);
    var result = await saveState(data.idCloudProviders.value);
    _loadingState.sink.add(AppState.Idle);
    return Future.value(result);
  }
}

class GoogleDriveAPI {
  CloudClient _client;
  drive.DriveApi _driveApi;

  GoogleDriveAPI(AuthorizationTokenResponse response) {
    _client = CloudClient(defaultHeaders: {
      'Authorization': '${response.tokenType} ${response.accessToken}'
    });

    _driveApi = drive.DriveApi(_client);
  }

  Future<CloudConnection> createFolder(String xoonitEmail) async {
    try {
      var userInfoResponse =
          await _client.get('https://www.googleapis.com/oauth2/v1/userinfo');
      var email = json.decode(userInfoResponse.body)['email'];

      var folderShare = "xoonit_${email.split('@').first}";
      var responseFiles = await _driveApi.files.list(
          $fields: 'files(id,mimeType,name,permissions)',
          q: "mimeType='application/vnd.google-apps.folder' and trashed = false and name='$folderShare'",
          spaces: 'drive');

      if (responseFiles.files.isNotEmpty) {
        final permission = responseFiles.files.first?.permissions?.firstWhere(
            (element) => element.emailAddress == xoonitEmail,
            orElse: () => null);
        if ((permission != null && permission.role != 'writer') ||
            permission == null) {
          await _driveApi.permissions.create(
              drive.Permission()
                ..emailAddress = xoonitEmail
                ..role = 'writer'
                ..type = 'user',
              responseFiles.files.first.id);
        }
        return Future.value(
            CloudConnection(userEmail: email, sharedFolder: folderShare));
      }

      var responseFolder = await _driveApi.files.create(drive.File()
        ..name = '$folderShare'
        ..sharingUser
        ..mimeType = 'application/vnd.google-apps.folder');

      await _driveApi.permissions.create(
          drive.Permission()
            ..emailAddress = xoonitEmail
            ..role = 'writer'
            ..type = 'user',
          responseFolder.id);

      return Future.value(
          CloudConnection(userEmail: email, sharedFolder: folderShare));
    } catch (err) {
      return Future.value(null);
    }
  }

  setPermission(String folderID, String xoonitEmail) async {}
}

class OneDriveAPI {
  CloudClient _client;
  String _idToken;

  OneDriveAPI(AuthorizationTokenResponse response) {
    _idToken = response.idToken;
    print(response.accessToken);
    _client = CloudClient(defaultHeaders: {
      'Authorization': '${response.tokenType} ${response.accessToken}'
    });
  }

  Future<CloudConnection> createFolder(String xoonitEmail) async {
    try {
      var userInfoResponse =
          await _client.get('https://graph.microsoft.com/v1.0/me/');
      var email = json.decode(userInfoResponse.body)['userPrincipalName'];
      var folderShare = 'xoonit_${email.split('@').first}';

      final jsonCreateFolder = jsonEncode({
        'name': folderShare,
        'folder': {},
      });

      var response = await _client.post(
          'https://graph.microsoft.com/v1.0/me/drive/root/children',
          headers: {'Content-type': 'application/json'},
          body: jsonCreateFolder);

      var folderID = json.decode(response.body)['id'];
      final jsonRequestShareFolder = jsonEncode({
        'requireSignIn': false,
        'sendInvitation': false,
        'roles': ['write'],
        'recipients': [
          {'email': xoonitEmail}
        ],
      });

      await _client.post(
          'https://graph.microsoft.com/v1.0/me/drive/items/$folderID/invite',
          headers: {'Content-type': 'application/json'},
          body: jsonRequestShareFolder);
      return Future.value(
          CloudConnection(userEmail: email, sharedFolder: folderShare));
    } catch (err) {
      return Future.value(null);
    }
  }
}

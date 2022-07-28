import 'package:rxdart/rxdart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xoonit/app/api/api_service.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/user_info.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/utils/general_method.dart';

class AppStateBloc extends BlocBase implements ApiServiceHandler {
  final BehaviorSubject<AppState> _appState =
      BehaviorSubject<AppState>.seeded(AppState.Loading);
  Stream<AppState> get appState => _appState.stream;

  AppState get initState => AppState.Loading;

  static SharedPreferences sharePref;

  final BehaviorSubject<AppState> _apiState =
      BehaviorSubject<AppState>.seeded(AppState.Loading);
  Stream<AppState> get apiState => _apiState.stream;

  bool _isLaunchingApp = false;

  void launchingApp() async {
    if (_isLaunchingApp) {
      return;
    }
    _isLaunchingApp = true;
    sharePref = await SharedPreferences.getInstance();
    buildFlavor =
        sharePref.getString(ConstantValues.buildFavorMode).toBuildFlavorMode;
    String accessToken = sharePref.getString(ConstantValues.accessToken);
    if (accessToken != null && accessToken != '') {
      XoonitApplication.instance.setUserInfor(UserInfo(
          accessToken: accessToken,
          userName: sharePref.getString(ConstantValues.userName) ?? '',
          nickName: sharePref.getString(ConstantValues.userNickName) ?? '',
          userID: sharePref.getString(ConstantValues.userID) ?? '',
          refreshToken: sharePref.getString(ConstantValues.refreshToken) ?? '',
          expiresIn: sharePref.getInt(ConstantValues.timeToRefresh) ?? 0,
          email: sharePref.getString(ConstantValues.email) ?? '',
          idApplicationOwner:
              sharePref.getString(ConstantValues.idApplicationOwner) ?? '',
          idCloudConnection:
              sharePref.getString(ConstantValues.idCloudConnection) ?? '',
          idLogin: sharePref.getString(ConstantValues.idLogin) ?? '',
          idRepLanguage:
              sharePref.getString(ConstantValues.idRepLanguage) ?? '',
          avatarUrl: sharePref.getString(ConstantValues.avatarUrl) ?? '',
          firstName: sharePref.getString(ConstantValues.firstName) ?? '',
          lastName: sharePref.getString(ConstantValues.lastName) ?? ''));
    }

    appApiService.create();
    appApiService.apiServiceHandler = this;
    // await Future.delayed(Duration(seconds: 3)).then((__) {});
    if (XoonitApplication.instance.isUserLogin()) {
      await GeneralMethod.refreshToken(
          XoonitApplication.instance.userInfo.refreshToken);
    }
    _appState.sink.add(AppState.Idle);
    _isLaunchingApp = false;
  }

  @override
  void dispose() {
    _appState?.close();
    _apiState?.close();
  }

  @override
  onError(ApiServerErrorData onError) {
    //Show Alert
  }

  @override
  onState(AppState state) {
    _apiState.sink.add(state);
  }
}

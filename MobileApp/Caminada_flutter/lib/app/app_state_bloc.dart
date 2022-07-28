import 'package:rxdart/rxdart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:caminada/app/api/api_service.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/user_info.dart';
import 'package:caminada/app/utils/general_method.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:caminada/app/constants/constants_value.dart';

class AppStateBloc extends BlocBase implements ApiServiceHandler {
  final BehaviorSubject<AppState> _appState =
      BehaviorSubject<AppState>.seeded(AppState.Loading);
  Stream<AppState> get appState => _appState.stream;

  AppState get initState => AppState.Loading;

  static SharedPreferences sharePref;

  // final BehaviorSubject<AppState> _apiState =
  //     BehaviorSubject<AppState>.seeded(AppState.Loading);
  // Stream<AppState> get apiState => _apiState.stream;

  void launchingApp() async {
    sharePref = await SharedPreferences.getInstance();
    buildFlavor =
        sharePref.getString(ConstantValues.buildFavorMode).toBuildFlavorMode;
    String accessToken = sharePref.getString(ConstantValues.accessToken);
    if (accessToken != null && accessToken != '') {
      CaminadaApplication.instance.setUserInfor(UserInfo(
          accessToken: accessToken,
          userName: sharePref.getString(ConstantValues.userName) ?? '',
          nickName: sharePref.getString(ConstantValues.userNickName) ?? '',
          email: sharePref.getString(ConstantValues.userEmail) ?? '',
          userID: sharePref.getString(ConstantValues.userID) ?? '',
          refreshToken: sharePref.getString(ConstantValues.refreshToken) ?? '',
          expiresIn: sharePref.getInt(ConstantValues.timeToRefresh) ?? 0,
          idLoginRoles: GeneralMethod.getLoginRoles(
                  sharePref.getString(ConstantValues.idLoginRoles)) ??
              IdLoginRoles.User));
    }

    appApiService.create();
    appApiService.apiServiceHandler = this;
    if (accessToken != null) {
      await GeneralMethod.getDocumentTree().then((value) {
        if (CaminadaApplication.instance.documentTreeItemList.length <= 0) {
          GeneralMethod.clearUserData();
        }
      });
    }
    // await Future.delayed(Duration(seconds: 3)).then((__) {});
    _appState.sink.add(AppState.Idle);
  }

  @override
  void dispose() {
    _appState?.close();
  }

  @override
  onError(ApiServerErrorData onError) {
    //Show Alert
  }

  @override
  onState(AppState state) {
    // _apiState.sink.add(state);
  }
}

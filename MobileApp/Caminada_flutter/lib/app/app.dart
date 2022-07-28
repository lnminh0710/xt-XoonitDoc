import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/app_state_bloc.dart';
import 'package:caminada/app/constants/themes.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/routes/routes.dart';
import 'package:caminada/app/ui/screen/splash_screen.dart';
import 'package:caminada/app/utils/firebase/firebase_analytics_wapper.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/app/utils/caminada_application.dart';

class AppMaster extends StatefulWidget {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey();
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<AppMaster> {
  AppStateBloc _appStateBloc;
  FirebaseAnalyticsAbs analytics;

  @override
  void initState() {
    _appStateBloc = AppStateBloc();
    analytics = FirebaseAnalyticsWapper()..init();

    super.initState();
  }

  @override
  void dispose() {
    _appStateBloc.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    printLog("[AppMaster] build");
    return BlocProvider(
        bloc: _appStateBloc,
        child: StreamBuilder<AppState>(
            stream: _appStateBloc.appState,
            initialData: _appStateBloc.initState,
            builder:
                (BuildContext buildContext, AsyncSnapshot<AppState> snapshot) {
              return renderScreen(snapshot.data);
            }));
  }

  renderScreen(AppState appState) {
    printLog("[AppMaster] renderScreen data: ${appState.toString()}");
    switch (appState) {
      case AppState.Loading:
        _appStateBloc.launchingApp();
        return MaterialApp(home: SplashScreen());
      case AppState.Idle:
        return MaterialApp(
          theme: AppTheme.buildDarkTheme().data,
          navigatorObservers: analytics.getMNavigatorObservers(),
          initialRoute: CaminadaApplication.instance.isUserLogin()
              ? RoutesName.SCAN
              : RoutesName.LOGIN_SCREEN,
          onGenerateRoute: RouteGenerator.buildRoutes,
          navigatorKey: AppMaster.navigatorKey,
        );
    }
  }
}

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/constants/themes.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/splash_screen.dart';
import 'package:xoonit/app/utils/firebase/firebase_analytics_wapper.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class AppMaster extends StatefulWidget {
  static final GlobalKey<NavigatorState> globalNavigatorKey = GlobalKey();
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
          debugShowCheckedModeBanner: false,
          theme: AppTheme.buildLightTheme().data,
          key: ValueKey('Unauthorized'),
          navigatorObservers: analytics.getMNavigatorObservers(),
          initialRoute: XoonitApplication.instance.isUserLogin()
              ? RoutesName.HOME_SCREEN
              : RoutesName.LOGIN_SCREEN,
          onGenerateRoute: RouteGenerator.buildRoutes,
          navigatorKey: AppMaster.globalNavigatorKey,
        );
    }
  }
}

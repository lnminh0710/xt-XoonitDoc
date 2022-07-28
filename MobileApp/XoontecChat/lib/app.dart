import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:xoontec_chat/repository/app_repository.dart';
import 'package:xoontec_chat/screen/authentication/authentication.dart';
import 'package:xoontec_chat/screen/home/home.dart';
import 'package:xoontec_chat/screen/login/login.dart';
import 'package:xoontec_chat/screen/splash/splash.dart';
import 'package:xoontec_chat/theme/app_theme.dart';
import 'package:xoontec_chat/theme/theme_state.dart';

class App extends StatelessWidget {
  const App({
    this.appRepository,
    Key key,
  }) : super(key: key);

  final AppRepository appRepository;
  @override
  Widget build(BuildContext context) {
    return RepositoryProvider.value(
      value: appRepository,
      child: BlocProvider(
        create: (_) => AuthenticationBloc(appRepository),
        child: AppView(),
      ),
    );
  }
}

class AppView extends StatefulWidget {
  @override
  _AppViewState createState() => _AppViewState();
}

class _AppViewState extends State<AppView> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  NavigatorState get _navigator => _navigatorKey.currentState;
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      locale: Locale('en'),
      supportedLocales: [
        Locale('en', 'en'),
        Locale('vi', "vi"),
        Locale("fr", 'fr'),
        Locale("zh", 'zh')
      ],
      localeResolutionCallback: (locale, supportedLocales) {
        return locale;
      },
      debugShowCheckedModeBanner: false,
      navigatorKey: _navigatorKey,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: Provider.of<ThemeState>(context).isDarkMode
          ? ThemeMode.dark
          : ThemeMode.light,
      builder: (context, child) {
        return BlocListener<AuthenticationBloc, AuthenticationState>(
          listener: (context, state) {
            switch (state.status) {
              case AuthenticationStatus.authenticated:
                _navigator.pushAndRemoveUntil<void>(
                  HomePage.route(),
                  (route) => false,
                );
                break;
              case AuthenticationStatus.unauthenticated:
                _navigator.pushAndRemoveUntil<void>(
                  LoginPage.route(),
                  (route) => false,
                );
                break;
              default:
                break;
            }
          },
          child: child,
        );
      },
      onGenerateRoute: (_) => SplashPage.route(),
    );
  }
}

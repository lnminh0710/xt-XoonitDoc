import 'package:caminada/app/ui/screen/gallery/gallery_bloc.dart';
import 'package:caminada/app/ui/screen/gallery/gallery_screen.dart';
import 'package:caminada/app/ui/screen/history/history_bloc.dart';
import 'package:caminada/app/ui/screen/history/history_screen.dart';
import 'package:caminada/app/ui/screen/login/login_bloc.dart';
import 'package:caminada/app/ui/screen/login/login_screen.dart';
import 'package:caminada/app/ui/screen/photo_detail/photo_detail_screen.dart';
import 'package:caminada/app/ui/screen/scan/scan_screen.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:caminada/core/routesbase.dart';
import 'package:flutter/cupertino.dart';

class RoutesName {
  static const String LOGIN_SCREEN = "/login-screen";
  static const String SCAN = "/scan";
  static const String PHOTO = "/photo";
  static const String PHOTO_DETAIL = "/photo_detail";
  static const String HISTORY = "/history";
}

class RouteGenerator {
  static Route buildRoutes(RouteSettings settings) {
    switch (settings.name) {
      case RoutesName.LOGIN_SCREEN:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: LoginBloc(),
              child: LoginScreen(),
            ));
      case RoutesName.SCAN:
        return buildRoute(
            settings,
            ScanScreen());
      case RoutesName.PHOTO:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: GalleryBloc(),
              child: GalleryScreen(),
            ));
      case RoutesName.PHOTO_DETAIL:
        List<String> listURL = settings.arguments;
        return buildRoute(
            settings,
            BlocProvider(
              bloc: EmptyBloc(),
              child: PhotosDetailScreen(lsImagePath: listURL),
            ));
      case RoutesName.HISTORY:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: HistoryBloc(),
              child: HistoryScreen(),
            ));

      default:
        return null;
    }
  }
}

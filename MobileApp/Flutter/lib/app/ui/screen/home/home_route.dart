import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/capture/capture_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/capture_screen.dart';
import 'package:xoonit/app/ui/screen/cloud/cloud_bloc.dart';
import 'package:xoonit/app/ui/screen/cloud/cloud_screen.dart';
import 'package:xoonit/app/ui/screen/contact/contact_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_screen.dart';
import 'package:xoonit/app/ui/screen/contact/contact_screen.dart';
import 'package:xoonit/app/ui/screen/global_search/global_search_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/global_search_screen.dart';
import 'package:xoonit/app/ui/screen/history/history_bloc.dart';
import 'package:xoonit/app/ui/screen/history/history_screen.dart';
import 'package:xoonit/app/ui/screen/import/import_bloc.dart';
import 'package:xoonit/app/ui/screen/import/import_screen.dart';
import 'package:xoonit/app/ui/screen/mydm/mydm_bloc.dart';
import 'package:xoonit/app/ui/screen/mydm/mydm_screen.dart';
import 'package:xoonit/app/ui/screen/photo/photo_bloc.dart';
import 'package:xoonit/app/ui/screen/photo/photo_screen.dart';
import 'package:xoonit/app/ui/screen/scan/scan_bloc.dart';
import 'package:xoonit/app/ui/screen/scan/scan_screen.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/routesbase.dart';

import 'home_enum.dart';

class HomeRoutes {
  static const String GLOBAL_SEARCH = "home-screen/global";
  static const String MYDM = "home-screen/mydm";
  static const String CAPTURE = "home-screen/capture";
  static const String CONTACT = "home-screen/contact";
  static const String IMPORT = "home-screen/import";
  static const String EXPORT = "home-screen/export";
  static const String CLOUD = "home-screen/cloud";
  static const String HISTORY = "home-screen/history";
  static const String PHOTOS = "home-screen/photos";
  static const String SCAN = "home-screen/scan";
  static const String CONTACT_DETAILS = "home-screen/contact-details";

  static Route onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case GLOBAL_SEARCH:
        return buildRoute(
            settings,
            BlocProvider<GlobalSearchBloc>(
              bloc: GlobalSearchBloc(),
              child: GlobalSearchScreen(),
            ));
      case MYDM:
        int idDocumentTree;
        if (settings.arguments != null) {
          idDocumentTree = settings.arguments ?? 0;
        }
        if (idDocumentTree == null) {
          return buildRoute(
              settings,
              BlocProvider<GlobalSearchBloc>(
                bloc: GlobalSearchBloc(),
                child: GlobalSearchScreen(),
              ));
        }
        return buildRoute(
            settings,
            BlocProvider(
              bloc: MyDMBloc(idDocumentTree: idDocumentTree),
              child: MyDMScreen(),
            ));
        break;
      case IMPORT:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: ImportBloc(),
              child: ImportScreen(),
            ));
        break;
      case HISTORY:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: HistoryBloc(),
              child: HistoryScreen(),
            ));
      case CONTACT:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: ContactBloc(),
              child: ContactScreen(),
            ));
        break;
      case CONTACT_DETAILS:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: ContactDetailsBloc(),
              child: ContactDetailsScreen(),
            ));
        break;
      case CAPTURE:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: CaptureBloc(),
              child: CaptureScreen(),
            ));
        break;
      case SCAN:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: ScanBloc(),
              child: ScanScreen(),
            ));
      case PHOTOS:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: PhotoBloc(),
              child: PhotoScreen(),
            ));
      case EXPORT:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: GlobalSearchBloc(),
              child: GlobalSearchScreen(),
            ));
        break;

        case CLOUD:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: CloudBloc(),
              child: CloudScreen(),
            ));
      default:
        return buildRoute(
            settings,
            BlocProvider<GlobalSearchBloc>(
              bloc: GlobalSearchBloc(),
              child: GlobalSearchScreen(),
            ));
    }
  }
}

// class CustomRoute<T> extends MaterialPageRoute<T> {
//   CustomRoute({WidgetBuilder builder, RouteSettings settings})
//       : super(builder: builder, settings: settings);

//   @override
//   Widget buildTransitions(BuildContext context, Animation<double> animation,
//       Animation<double> secondaryAnimation, Widget child) {
//     return FadeTransition(opacity: animation, child: child);
//   }
// }

extension EHomeScreenChildExtension on EHomeScreenChild {
  get routeName {
    switch (this) {
      case EHomeScreenChild.myDM:
        return HomeRoutes.MYDM;
      case EHomeScreenChild.capture:
        return HomeRoutes.CAPTURE;
      case EHomeScreenChild.contact:
        return HomeRoutes.CONTACT;
      case EHomeScreenChild.scan:
        return HomeRoutes.SCAN;
      case EHomeScreenChild.import:
        return HomeRoutes.IMPORT;
      case EHomeScreenChild.export:
        return HomeRoutes.EXPORT;
      case EHomeScreenChild.cloud:
        return HomeRoutes.CLOUD;
      case EHomeScreenChild.userguide:
        return HomeRoutes.IMPORT;
      case EHomeScreenChild.history:
        return HomeRoutes.HISTORY;
      case EHomeScreenChild.photos:
        return HomeRoutes.PHOTOS;
      case EHomeScreenChild.contactDetails:
        return HomeRoutes.CONTACT_DETAILS;
      default:
        return HomeRoutes.GLOBAL_SEARCH;
    }
  }
}

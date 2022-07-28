import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/dash_board/app_routes.dart';

extension NavigatorStateExtension on NavigatorState {
  Future<T> pushNamedIfNotCurrent<T extends Object>(String routeName,
      {Object arguments}) async {
    if (routeName == AppRoutes.HOME) {
      return await pushNamedAndRemoveUntil(
          routeName, (Route<dynamic> route) => false,
          arguments: arguments);
    } else {
      if (!isCurrent(routeName)) {
        return await pushNamed(routeName, arguments: arguments);
      } else {
        return await pushReplacementNamed(routeName, arguments: arguments);
      }
    }
  }

  bool isCurrent(String routeName) {
    bool isCurrent = false;
    popUntil((route) {
      if (route.settings.name == routeName) {
        isCurrent = true;
      }
      return true;
    });
    return isCurrent;
  }
}

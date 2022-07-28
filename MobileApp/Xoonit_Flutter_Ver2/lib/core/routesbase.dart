
import 'package:flutter/material.dart';

MaterialPageRoute buildRoute(RouteSettings settings, Widget builder) {
  return MaterialPageRoute(
    settings: settings,
    builder: (BuildContext context) => builder,
  );
}

MaterialPageRoute buildDialog(RouteSettings settings, Widget builder) {
  return MaterialPageRoute(
      settings: settings,
      builder: (BuildContext context) => builder,
      fullscreenDialog: true);
}
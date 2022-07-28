import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';

enum ThemeApp { LIGHT, DARK }

class AppTheme {
  final String name;
  final ThemeData data;

  const AppTheme(this.name, this.data);
  static AppTheme buildLightTheme() {
    return AppTheme(
        'light',
        ThemeData(
          primaryColor: Colors.white,
          scaffoldBackgroundColor: Colors.white,
          fontFamily: FontFamily.robotoMedium,
          brightness: Brightness.light,
          accentColorBrightness: Brightness.light,
        ));
  }

  static AppTheme buildDarkTheme() {
    return AppTheme(
        'dark',
        ThemeData(
          primaryColor: Colors.white,
          scaffoldBackgroundColor: Colors.white,
          fontFamily: FontFamily.robotoMedium,
          brightness: Brightness.light,
          accentColorBrightness: Brightness.light,
          // primaryColor: Colors.white,
        ));
  }
}

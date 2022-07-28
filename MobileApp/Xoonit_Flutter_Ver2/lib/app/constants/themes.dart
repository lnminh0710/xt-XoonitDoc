import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/constants/colors.dart';

enum ThemeApp { LIGHT, DARK }

class AppTheme {
  final String name;
  final ThemeData data;

  const AppTheme(this.name, this.data);
  static AppTheme buildLightTheme() {
    return AppTheme(
        'light',
        ThemeData(
            primaryColor: MyColors.textLink,
            scaffoldBackgroundColor: Colors.white,
            fontFamily: FontFamily.robotoMedium,
            brightness: Brightness.light,
            accentColorBrightness: Brightness.light,
            accentColor: MyColors.textLink,
            appBarTheme: AppBarTheme(
              brightness: Brightness.light,
              color: Colors.white,
              iconTheme: IconThemeData(
                color: Colors.black,
              ),
            )));
  }

  static AppTheme buildDarkTheme() {
    return AppTheme(
        'dark',
        ThemeData(
          primaryColor: MyColors.blueColor,
          scaffoldBackgroundColor: Colors.white,
          fontFamily: FontFamily.robotoMedium,
          brightness: Brightness.dark,
          accentColorBrightness: Brightness.dark,

          // primaryColor: Colors.white,
        ));
  }
}

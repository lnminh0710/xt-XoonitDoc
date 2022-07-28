import 'package:flutter/material.dart';

class AppTheme {
  //
  AppTheme._();

  static final ThemeData lightTheme = ThemeData(
    scaffoldBackgroundColor: Colors.white,
    brightness: Brightness.light,
    hintColor: Colors.grey,
    appBarTheme: AppBarTheme(
      color: Colors.white,
      iconTheme: IconThemeData(
        color: Colors.blue,
      ),
    ),
    buttonTheme: ButtonThemeData(
        buttonColor: Colors.blueAccent,
        disabledColor: Colors.grey[300],
        textTheme: ButtonTextTheme.primary),
    colorScheme: ColorScheme.light(
      primary: Colors.blue,
      onPrimary: Colors.blueAccent,
      primaryVariant: Colors.green,
      secondary: Colors.green,
      secondaryVariant: Colors.greenAccent,
      brightness: Brightness.light,
    ),
    cardTheme: CardTheme(
      color: Colors.white,
    ),
    iconTheme: IconThemeData(color: Colors.blueAccent, size: 32),
    primaryTextTheme: TextTheme(
      headline1: TextStyle(
        color: Colors.black,
        fontSize: 20.0,
      ),
      headline2: TextStyle(
        color: Colors.black,
        fontSize: 20.0,
      ),
      headline3: TextStyle(
        color: Colors.black,
        fontSize: 20.0,
      ),
      headline4: TextStyle(
        color: Colors.black,
        fontSize: 20.0,
      ),
      headline6: TextStyle(
        color: Colors.black,
        fontSize: 20.0,
      ),
      subtitle1: TextStyle(
        color: Colors.black87,
        fontSize: 18.0,
      ),
      subtitle2: TextStyle(
        color: Colors.black87,
        fontSize: 16.0,
      ),
      bodyText1: TextStyle(
        color: Colors.black,
        fontSize: 14.0,
      ),
      bodyText2: TextStyle(
        color: Colors.black,
        fontSize: 14.0,
      ),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    scaffoldBackgroundColor: Colors.grey[900],
    brightness: Brightness.dark,
    hintColor: Colors.white70,
    inputDecorationTheme: InputDecorationTheme(
      focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.greenAccent)),
      enabledBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: Colors.white70),
      ),
      border: UnderlineInputBorder(
        borderSide: BorderSide(color: Colors.white),
      ),
    ),
    appBarTheme: AppBarTheme(
      color: Colors.black,
      iconTheme: IconThemeData(
        color: Colors.greenAccent,
      ),
    ),
    buttonTheme: ButtonThemeData(
        buttonColor: Colors.greenAccent,
        disabledColor: Colors.red,
        textTheme: ButtonTextTheme.primary),
    colorScheme: ColorScheme.dark(
        primary: Colors.green,
        onPrimary: Colors.greenAccent,
        primaryVariant: Colors.white,
        secondary: Colors.blue,
        onSecondary: Colors.blueAccent,
        brightness: Brightness.dark),
    cardTheme: CardTheme(
      color: Colors.black,
    ),
    iconTheme: IconThemeData(color: Colors.greenAccent, size: 32),
    primaryTextTheme: TextTheme(
      headline1: TextStyle(
        color: Colors.white,
        fontSize: 20.0,
      ),
      headline2: TextStyle(
        color: Colors.white,
        fontSize: 20.0,
      ),
      headline3: TextStyle(
        color: Colors.white,
        fontSize: 20.0,
      ),
      headline4: TextStyle(
        color: Colors.white,
        fontSize: 20.0,
      ),
      headline6: TextStyle(
        color: Colors.white,
        fontSize: 20.0,
      ),
      subtitle1: TextStyle(
        color: Colors.white,
        fontSize: 18.0,
      ),
      subtitle2: TextStyle(
        color: Colors.white,
        fontSize: 16.0,
      ),
      bodyText1: TextStyle(
        color: Colors.white,
        fontSize: 14.0,
      ),
      bodyText2: TextStyle(
        color: Colors.white,
        fontSize: 14.0,
      ),
    ),
  );
}

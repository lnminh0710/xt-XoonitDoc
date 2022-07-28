import 'package:flutter/material.dart';
 
class ThemeState extends ChangeNotifier {
  //
  bool isDarkMode = false;
 
  void updateTheme(bool isDarkMode) {
    this.isDarkMode = isDarkMode;
    notifyListeners();
  }
}
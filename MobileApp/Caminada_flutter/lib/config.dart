
// ==================== CONFIG APP ====================
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:caminada/app/app.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/utils/database/database_manager.dart';
import 'package:caminada/core/ultils.dart';

setupEnv(BuildFlavor buildFlavor, [bool runTest = false]) async {
  if (runTest == false) {
    await appSetup();
  }

  appName = "Future";

  switch (buildFlavor) {
    case BuildFlavor.mockDataOffline:
      printLog("===> MOCK data offline <===");
      break;
    case BuildFlavor.staging:
    case BuildFlavor.production:
      appBaseUrl = "https://caminada.xoontec.ch/api/";
      break;
    case BuildFlavor.development:
    case BuildFlavor.devTeam:
      appBaseUrl = "https://caminada-dev.xoontec.vn:445/api/";
      break;
    default:
      break;
  }

  printLog("[version: $appVersion] -> appBaseUrl: $appBaseUrl");
}

runMain() async {
  WidgetsFlutterBinding.ensureInitialized();
  await setupEnv(buildFlavor);
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  await SystemChrome.setEnabledSystemUIOverlays([]);
  await DatabaseManager.init();
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark.copyWith(
    statusBarColor: Colors.transparent, //or set color with: Color(0xFF0000FF)
  ));
  await Future.delayed(Duration(milliseconds: 500));
  runApp(AppMaster());
}

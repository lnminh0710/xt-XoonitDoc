
// ==================== CONFIG APP ====================
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/core/ultils.dart';

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
      appBaseUrl = "http://mydms.xoontec.vn/api/";
      break;
    case BuildFlavor.development:
    case BuildFlavor.devTeam:
      appBaseUrl = "http://mydmsaot.xena.local/api/";
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
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark.copyWith(
    statusBarColor: Colors.transparent, //or set color with: Color(0xFF0000FF)
  ));
  await Future.delayed(Duration(milliseconds: 500));
  runApp(AppMaster());
}

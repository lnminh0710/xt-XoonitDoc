import 'package:xoontec_chat/api/api_service.dart';
import 'package:xoontec_chat/repository/models/model_language.dart';

enum BuildFlavor {
  mockDataOffline,
  mockDataOnline,
  devTeam,
  development,
  staging,
  production
}

String appBaseUrl = "http://mydmsdev.xena.local/api/";

BuildFlavor buildFlavor = BuildFlavor.development;

AppApiService appApiService = AppApiService();

Map<String, String> languageJsonData = Map();
ApplicationLanguage applicationLanguage = ApplicationLanguage();

//=============== CORE ====================
const String LOG_TAG = "[Xoontec Chat]";
const CHEAT = true;
const FULL_LOG = false;

void printLog(dynamic data) {
  if (CHEAT == true || buildFlavor != BuildFlavor.production) {
    String text = "$LOG_TAG${data.toString()}";

    if (FULL_LOG == true) {
      final pattern = new RegExp('.{1,800}'); // 800 is the size of each chunk
      pattern.allMatches(text).forEach((match) => print(match.group(0)));
    } else {
      // logger.d(text);
      print(text);
    }
  }
}

enum AppState { Loading, Idle }

extension BuildFlavorExtension on BuildFlavor {
  String get name {
    switch (this) {
      case BuildFlavor.production:
        return "Production";
      case BuildFlavor.development:
        return "Development";
      default:
        return "";
    }
  }
}

extension StringExtension on String {
  BuildFlavor get toBuildFlavorMode {
    switch (this) {
      // case BuildFlavor.production.name:
      case "Production":
        return BuildFlavor.production;
        break;
      default:
        return BuildFlavor.development;
    }
  }
}

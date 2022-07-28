import 'package:logger/logger.dart';
import 'package:caminada/app/api/api_service.dart';

enum BuildFlavor {
  mockDataOffline,
  mockDataOnline,
  devTeam,
  development,
  staging,
  production
}

BuildFlavor buildFlavor = BuildFlavor.development;

AppApiService appApiService = AppApiService();

String appVersion = "1.0.0";
String appName = "Caminada";
String appBaseUrl = "http://caminada.xoontec.vn/api/";

//=============== CORE ====================
const String LOG_TAG = "[Caminada]";
const CHEAT = true;
const FULL_LOG = false;

final logger = Logger();
void printLog(data) {
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
enum ModeViewDocument { SingleMode, BatchMode }
enum IdLoginRoles { MainAdministrator, Administrator, User }

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
      case "Development":
        return BuildFlavor.development;
        break;
      default:
        return BuildFlavor.production;
    }
  }
}

extension IdLoginRoleExtendsion on IdLoginRoles {
  String get getloginRoles {
    switch (this) {
      case IdLoginRoles.MainAdministrator: // id =1
        return "4DFF4EA340F0A823F15D3F4F01AB62EAE0E5DA579CCB851F8DB9DFE84C58B2B37B89903A740E1EE172DA793A6E79D560E5F7F9BD058A12A280433ED6FA46510A";
        break;
      case IdLoginRoles.Administrator: // id =2
        return "40B244112641DD78DD4F93B6C9190DD46E0099194D5A44257B7EFAD6EF9FF4683DA1EDA0244448CB343AA688F5D3EFD7314DAFE580AC0BCBF115AECA9E8DC114";
        break;
      default:
        return "3BAFBF08882A2D10133093A1B8433F50563B93C14ACD05B79028EB1D12799027241450980651994501423A66C276AE26C43B739BC65C4E16B10C3AF6C202AEBB";
    }
  }
}

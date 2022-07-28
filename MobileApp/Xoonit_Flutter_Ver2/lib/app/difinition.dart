import 'package:logger/logger.dart';
import 'package:xoonit/app/api/api_service.dart';

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
String appName = "Xoonit";
String appBaseUrl = "http://mydmsdev.xena.local/api/";

//=============== CORE ====================
const String LOG_TAG = "[Xoonit]";
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
enum SyncStatus { DONE, UPLOADING, ERROR }
enum FolderDocument { Invoice, Contract, Other }

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

extension SyncStatusExtension on SyncStatus {
  String get statusSync {
    switch (this) {
      case SyncStatus.DONE:
        return "Sync Ok";
        break;
      case SyncStatus.UPLOADING:
        return "Sync in progres..";
        break;
      default:
        return null;
    }
  }
}

extension FolderDocumentExtension on FolderDocument {
  int get idRepTreeMediaType {
    switch (this) {
      case FolderDocument.Invoice:
        return 1;
        break;
      case FolderDocument.Contract:
        return 2;
        break;
      default:
        return 3;
    }
  }

  String get cloudMediaPath {
    switch (this) {
      case FolderDocument.Invoice:
        return "Invoices";
        break;
      case FolderDocument.Contract:
        return "Contracts";
        break;
      default:
        return "OtherDocument";
    }
  }
}

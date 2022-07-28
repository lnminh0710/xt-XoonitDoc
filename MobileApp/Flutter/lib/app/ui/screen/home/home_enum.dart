import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/resources.dart';

enum EHomeScreenChild {
  globalSearch,
  myDM,
  capture,
  contact,
  scan,
  import,
  export,
  cloud,
  userguide,
  history,

  photos,
  contactDetails
}

extension EHomeScreenChildExtension on EHomeScreenChild {
  get title {
    switch (this) {
      case EHomeScreenChild.globalSearch:
        return "Global Search";
      case EHomeScreenChild.myDM:
        return "MyDM";
      case EHomeScreenChild.capture:
        return "Capture";
      case EHomeScreenChild.contact:
        return "Contact";
      case EHomeScreenChild.scan:
        return "Scan";
      case EHomeScreenChild.import:
        return "Import";
      case EHomeScreenChild.export:
        return "Export";
      case EHomeScreenChild.cloud:
        return "Cloud";
      case EHomeScreenChild.userguide:
        return "User Guide";
      case EHomeScreenChild.history:
        return "History";
      case EHomeScreenChild.photos:
        return "Photos";
      case EHomeScreenChild.contactDetails:
        return "Contact Details";
    }
  }

  get icon {
    switch (this) {
      case EHomeScreenChild.myDM:
        return Image.asset(Resources.iconMyDM);
      case EHomeScreenChild.capture:
        return Image.asset(Resources.iconCapture);
      case EHomeScreenChild.contact:
        return Image.asset(Resources.iconContact);
      case EHomeScreenChild.scan:
        return Image.asset(Resources.iconScan);
      case EHomeScreenChild.import:
        return Image.asset(Resources.iconImport);
      case EHomeScreenChild.export:
        return Image.asset(Resources.iconExport);
      case EHomeScreenChild.cloud:
        return Image.asset(Resources.iconCloud);
      case EHomeScreenChild.userguide:
        return Image.asset(Resources.iconUserGuide);
      case EHomeScreenChild.history:
        return Image.asset(Resources.iconHistory);
      default:
        return SizedBox.shrink();
    }
  }
}

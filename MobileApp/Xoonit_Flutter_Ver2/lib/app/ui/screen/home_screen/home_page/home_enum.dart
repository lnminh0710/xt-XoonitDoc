import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/ui/screen/dash_board/app_routes.dart';

enum EHomeScreenChild {
  globalSearch,
  document,
  capture,
  contact,
  scan,
  import,
  export,
  cloud,
  userguide,
  history,
  photos,
  contactDetails,
  home,
  captureSearchDetail,
  contactSearchDetail,
  allDocumentSearchDetail,
  invoiceSearchDetail,
  contractSearchDetail,
  otherDocumentSearchDetail,
  todoDocumentSearchDetail,
  account,
  camera,
  reviewCapture,
  reviewDocument,
}

extension EHomeScreenChildExtension on EHomeScreenChild {
  get title {
    switch (this) {
      case EHomeScreenChild.globalSearch:
        return "Global Search";
      case EHomeScreenChild.document:
        return "Document";
      case EHomeScreenChild.capture:
        return "Processing";
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
      case EHomeScreenChild.home:
        return "Home";
      case EHomeScreenChild.contactDetails:
        return "Contact Details";
      case EHomeScreenChild.captureSearchDetail:
        return "Capture";
      case EHomeScreenChild.contactSearchDetail:
        return "Contact";
      case EHomeScreenChild.allDocumentSearchDetail:
        return "All Document";
      case EHomeScreenChild.invoiceSearchDetail:
        return "Invoice";
      case EHomeScreenChild.contractSearchDetail:
        return "Contract";
      case EHomeScreenChild.otherDocumentSearchDetail:
        return "Other Document";
      case EHomeScreenChild.todoDocumentSearchDetail:
        return "Todo Document";
      case EHomeScreenChild.account:
        return "Account";
      case EHomeScreenChild.camera:
        return "Capture";
      case EHomeScreenChild.reviewCapture:
        return "Processing";
      case EHomeScreenChild.reviewDocument:
        return "Document";
    }
  }

  Widget get icon {
    switch (this) {
      case EHomeScreenChild.document:
        return Image.asset(Resources.iconMyDM);
      case EHomeScreenChild.capture:
        return Image.asset(Resources.iconMyDM);
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
      case EHomeScreenChild.camera:
        return Image.asset(Resources.iconCamera);
      default:
        return SizedBox.shrink();
    }
  }

  String get routeName {
    switch (this) {
      case EHomeScreenChild.document:
        return AppRoutes.DOCUMENT;
      case EHomeScreenChild.capture:
        return AppRoutes.CAPTURE;
      case EHomeScreenChild.contact:
        return AppRoutes.CONTACT;
      case EHomeScreenChild.scan:
        return AppRoutes.SCAN;
      case EHomeScreenChild.import:
        return AppRoutes.IMPORT;
      case EHomeScreenChild.export:
        return AppRoutes.EXPORT;
      case EHomeScreenChild.cloud:
        return AppRoutes.CLOUD;
      case EHomeScreenChild.userguide:
        return AppRoutes.IMPORT;
      case EHomeScreenChild.history:
        return AppRoutes.HISTORY;
      case EHomeScreenChild.photos:
        return AppRoutes.PHOTOS;
      case EHomeScreenChild.contactDetails:
        return AppRoutes.CONTACT_DETAILS;
      case EHomeScreenChild.globalSearch:
        return AppRoutes.GLOBAL_SEARCH;
      case EHomeScreenChild.captureSearchDetail:
        return AppRoutes.CAPTURE_SEARCH_DETAIL;
      case EHomeScreenChild.contactSearchDetail:
        return AppRoutes.CONTACT_SEARCH_DETAIL;
      case EHomeScreenChild.allDocumentSearchDetail:
        return AppRoutes.ALL_DOCUMENT_SEARCH_DETAIL;
      case EHomeScreenChild.invoiceSearchDetail:
        return AppRoutes.INVOICE_SEARCH_DETAIL;
      case EHomeScreenChild.contractSearchDetail:
        return AppRoutes.CONTRACT_SEARCH_DETAIL;
      case EHomeScreenChild.otherDocumentSearchDetail:
        return AppRoutes.OTHER_DOCUMENT_SEARCH_DETAIL;
      case EHomeScreenChild.todoDocumentSearchDetail:
        return AppRoutes.TODO_DOCUMENT_SEARCH_DETAIL;
      case EHomeScreenChild.account:
        return AppRoutes.ACCOUNT;
      case EHomeScreenChild.reviewCapture:
        return AppRoutes.REVIEW_DOCUMENT_CAPTURE;
      case EHomeScreenChild.reviewDocument:
        return AppRoutes.REVIEW_DOCUMENT;
      default:
        return AppRoutes.HOME;
    }
  }
}

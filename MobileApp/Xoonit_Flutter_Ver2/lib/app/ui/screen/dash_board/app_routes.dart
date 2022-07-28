import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/capture/capture_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/capture_screen.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_screen.dart';
import 'package:xoonit/app/ui/screen/cloud/cloud_bloc.dart';
import 'package:xoonit/app/ui/screen/cloud/cloud_screen.dart';
import 'package:xoonit/app/ui/screen/contact/contact_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_screen.dart';
import 'package:xoonit/app/ui/screen/contact/contact_screen.dart';
import 'package:xoonit/app/ui/screen/global_search/global_search_screen.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_all_document_detail.dart/search_all_document_detail.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_all_document_detail.dart/search_all_document_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_capture_detail/search_capture_detail.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_capture_detail/search_capture_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_contact_detail/search_contact_detail.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_contact_detail/search_contact_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_contract_detail/search_contract_detail.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_contract_detail/search_contract_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_invoice_detail/search_invoice_detail.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_invoice_detail/search_invoice_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_other_document_detail/search_other_document_detail.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_other_document_detail/search_other_document_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_todo_document_detail/search_todo_document_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_todo_document_detail/search_todo_document_detail_screen.dart';
import 'package:xoonit/app/ui/screen/history/history_bloc.dart';
import 'package:xoonit/app/ui/screen/history/history_screen.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_screen.dart';
import 'package:xoonit/app/ui/screen/import/import_bloc.dart';
import 'package:xoonit/app/ui/screen/import/import_screen.dart';
import 'package:xoonit/app/ui/screen/mydm/mydm_bloc.dart';
import 'package:xoonit/app/ui/screen/mydm/mydm_screen.dart';
import 'package:xoonit/app/ui/screen/photo/photo_bloc.dart';
import 'package:xoonit/app/ui/screen/photo/photo_screen.dart';
import 'package:xoonit/app/ui/screen/profiles/profile_bloc.dart';
import 'package:xoonit/app/ui/screen/profiles/profile_screen.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/routesbase.dart';

class AppRoutes {
  static const String GLOBAL_SEARCH = "/home-screen/global";
  static const String DOCUMENT = "home-screen/document";
  static const String CAPTURE = "home-screen/capture";
  static const String CONTACT = "home-screen/contact";
  static const String IMPORT = "home-screen/import";
  static const String EXPORT = "home-screen/export";
  static const String CLOUD = "home-screen/cloud";
  static const String HISTORY = "home-screen/history";
  static const String PHOTOS = "home-screen/photos";
  static const String SCAN = "home-screen/scan";
  static const String HOME = "home-screen";
  static const String CONTACT_DETAILS = "home-screen/contact-details";
  static const String ACCOUNT = "home-screen/account";
  static const String CAPTURE_SEARCH_DETAIL =
      "home-screen/capture-search-detail";
  static const String CONTACT_SEARCH_DETAIL =
      "home-screen/contact-search-detail";
  static const String ALL_DOCUMENT_SEARCH_DETAIL =
      "home-screen/all-document-search-detail";
  static const String INVOICE_SEARCH_DETAIL =
      "home-screen/invoice-search-detail";
  static const String CONTRACT_SEARCH_DETAIL =
      "home-screen/contract-search-detail";
  static const String OTHER_DOCUMENT_SEARCH_DETAIL =
      "home-screen/other-document-search-detail";
  static const String TODO_DOCUMENT_SEARCH_DETAIL =
      "home-screen/todo-document-search-detail";
  static const String REVIEW_DOCUMENT_CAPTURE =
      "home-screen/review-document-capture";
  static const String REVIEW_DOCUMENT = "home-screen/review-document";
  static Route onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case GLOBAL_SEARCH:
        String keyWord = settings.arguments;
        return buildRoute(
          settings,
          GlobalSearchScreen(
            keyWord: keyWord ?? '',
          ),
        );
      case DOCUMENT:
        int idDocumentTree;
        if (settings.arguments != null) {
          idDocumentTree = settings.arguments ?? 0;
        }
        if (idDocumentTree == null) {
          return buildRoute(settings, GlobalSearchScreen());
        }
        return buildRoute(
            settings,
            BlocProvider(
              bloc: MyDMBloc(idDocumentTree: idDocumentTree),
              child: MyDMScreen(),
            ));
        break;
      case IMPORT:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: ImportBloc(),
              child: ImportScreen(),
            ));
        break;
      case HISTORY:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: HistoryBloc(),
              child: HistoryScreen(),
            ));
      case CONTACT:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: ContactBloc(),
              child: ContactScreen(),
            ));
        break;
      case CONTACT_DETAILS:
        String idPerson;
        String idPersonType;
        if (settings.arguments != null) {
          Map<String, String> _arguments = settings.arguments;
          idPerson = _arguments['idPerson'];
          idPersonType = _arguments['idPersonType'];
        }
        return buildRoute(
            settings,
            BlocProvider<ContactDetailsBloc>(
              child: ContactDetailsScreen(
                idPerson: idPerson,
                idPersonType: idPersonType,
              ),
              bloc: ContactDetailsBloc(
                  idPerson: idPerson, idPersonType: idPersonType),
            ));
        break;
      case ACCOUNT:
        return buildRoute(
            settings,
            BlocProvider<ProfilesBloc>(
                bloc: ProfilesBloc(), child: ProfilesScreen()));
        break;
      case CAPTURE:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: CaptureBloc(),
              child: CaptureScreen(),
            ));
        break;
      case SCAN:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: PhotoBloc(),
              child: PhotoScreen(),
            ));
      case PHOTOS:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: PhotoBloc(),
              child: PhotoScreen(),
            ));
      case EXPORT:
        return buildRoute(settings, GlobalSearchScreen());
        break;

      case CLOUD:
        return buildRoute(
            settings,
            BlocProvider(
              bloc: CloudBloc(),
              child: CloudScreen(),
            ));

      case CAPTURE_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchCaptureDetailBloc>(
              bloc: SearchCaptureDetailBloc(keywordSearch: keywordSearch),
              child: CaptureSeachDetail(),
            ));
      case CONTACT_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchContactDetailBloc>(
              bloc: SearchContactDetailBloc(keywordSearch: keywordSearch),
              child: ContactSeachDetail(),
            ));

      case ALL_DOCUMENT_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchAllDocumentDetailBloc>(
              bloc: SearchAllDocumentDetailBloc(keywordSearch: keywordSearch),
              child: SearchAllDocumentDetail(),
            ));

      case INVOICE_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchInvoiceDetailBloc>(
              bloc: SearchInvoiceDetailBloc(keywordSearch: keywordSearch),
              child: SearchInvoiceDetailScreen(),
            ));

      case CONTRACT_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchContractDetailBloc>(
              bloc: SearchContractDetailBloc(keywordSearch: keywordSearch),
              child: SearchContractDetailScreen(),
            ));

      case OTHER_DOCUMENT_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchOtherDocumentDetailBloc>(
              bloc: SearchOtherDocumentDetailBloc(keywordSearch: keywordSearch),
              child: SearchOtherDocumentDetailScreen(),
            ));

      case TODO_DOCUMENT_SEARCH_DETAIL:
        String keywordSearch;
        if (settings.arguments != null) {
          keywordSearch = settings.arguments ?? '*';
        }
        return buildRoute(
            settings,
            BlocProvider<SearchTodoDocumentDetailBloc>(
              bloc: SearchTodoDocumentDetailBloc(keywordSearch: keywordSearch),
              child: SearchTodoDocumentDetailScreen(),
            ));
      case REVIEW_DOCUMENT_CAPTURE:
        String idDocumentContainerScans = settings?.arguments ?? "";
        ReviewDocumentBloc reviewDocumentBloc =
            new ReviewDocumentBloc(idDocumentContainerScans);
        return buildRoute(
            settings,
            BlocProvider<ReviewDocumentBloc>(
              child: ReviewDocumentScreen(
                isEditableDocument: true,
              ),
              bloc: reviewDocumentBloc,
            ));
      case REVIEW_DOCUMENT:
        String idDocumentContainerScans = settings?.arguments ?? "";
        ReviewDocumentBloc reviewDocumentBloc =
            new ReviewDocumentBloc(idDocumentContainerScans);
        return buildRoute(
            settings,
            BlocProvider<ReviewDocumentBloc>(
              child: ReviewDocumentScreen(
                isEditableDocument: false,
                isHasTodoNotesField: true,
              ),
              bloc: reviewDocumentBloc,
            ));

      default:
        return buildRoute(
            settings,
            BlocProvider<HomeBloc>(
              bloc: HomeBloc(),
              child: HomeScreen(),
            ));
    }
  }
}

// class CustomRoute<T> extends MaterialPageRoute<T> {
//   CustomRoute({WidgetBuilder builder, RouteSettings settings})
//       : super(builder: builder, settings: settings);

//   @override
//   Widget buildTransitions(BuildContext context, Animation<double> animation,
//       Animation<double> secondaryAnimation, Widget child) {
//     return FadeTransition(opacity: animation, child: child);
//   }
// }

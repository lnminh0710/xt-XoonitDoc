import 'package:flutter/cupertino.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/model/signup_request.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen.dart';
import 'package:xoonit/app/ui/screen/congratulation_screen.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_screen.dart';
import 'package:xoonit/app/ui/screen/forgot_password/forgot_password.dart';
import 'package:xoonit/app/ui/screen/forgot_password/forgot_password_bloc.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/app/ui/screen/home/home_screen.dart';
import 'package:xoonit/app/ui/screen/login/login_bloc.dart';
import 'package:xoonit/app/ui/screen/login/login_screen.dart';
import 'package:xoonit/app/ui/screen/signup/profile_screen.dart';
import 'package:xoonit/app/ui/screen/signup/signup_bloc.dart';
import 'package:xoonit/app/ui/screen/signup/signup_screen.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/routesbase.dart';

import '../ui/screen/cheat/all_common_component.dart';
import '../ui/screen/home/home_bloc.dart';
import '../ui/screen/home/home_screen.dart';

class RoutesName {
  static const String LOGIN_SCREEN = "/login-screen";
  static const String HOME_SCREEN = "/home-screen";
  static const String CHEAT_SCREEN = "/cheat-screen";
  static const String HISTORY_SCREEN = "/history-screen";
  static const String SIGNUP_SCREEN = "/signup-screen";

  static const String FORGOT_PASSWORD_SCREEN = "/forgot-password-screen";
  static const String PROFILE_SCREEN = "/profile-screen";
  static const String CONGRATULATION_SCREEN = "/congratulation-screen";
  static const String CONTACT_DETAILS_SCREEN = "/contact-detail-screen";
  static const String REVIEW_DOCUMENT_CAPTURE =
      "/capture/review-document-capture";
  static const String REVIEW_DOCUMENT = "/mydm/review-document";

}

class RouteGenerator {
  static Route buildRoutes(RouteSettings settings) {
    switch (settings.name) {
      case RoutesName.LOGIN_SCREEN:
        LoginBloc loginBloc = new LoginBloc();
        return buildRoute(
            settings,
            BlocProvider<LoginBloc>(
              bloc: loginBloc,
              child: LoginScreen(),
            ));
      case RoutesName.SIGNUP_SCREEN:
        return buildRoute(settings, SignupScreen());

      case RoutesName.PROFILE_SCREEN:
        SignupRequest signUpRequest;
        SignupBloc signUpBloc = new SignupBloc();
        if (settings.arguments != null) {
          signUpRequest = settings.arguments;
        } else {
          signUpRequest = new SignupRequest();
        }
        return buildRoute(
            settings,
            BlocProvider<SignupBloc>(
                bloc: signUpBloc,
                child: ProfileScreen(signupRequest: signUpRequest)));
      case RoutesName.FORGOT_PASSWORD_SCREEN:
        ForgotPasswordBloc forgotPasswordBloc = new ForgotPasswordBloc();
        return buildRoute(
            settings,
            BlocProvider<ForgotPasswordBloc>(
              bloc: forgotPasswordBloc,
              child: ForgotPasswordScreen(),
            ));
      case RoutesName.HOME_SCREEN:
        HomeBloc homeBloc = new HomeBloc();
        return buildRoute(
            settings,
            BlocProvider<HomeBloc>(
              bloc: homeBloc,
              child: HomeScreen(),
            ));
      case RoutesName.CHEAT_SCREEN:
        return buildRoute(settings, AllComponentUI());
      case RoutesName.CONGRATULATION_SCREEN:
        return buildRoute(settings, CongratulationScreen());

      case RoutesName.CONTACT_DETAILS_SCREEN:
        ContactDetailsBloc contactDetailsBloc = new ContactDetailsBloc();
        Contact contact = new Contact();
        if (settings.arguments != null) {
          contact = settings.arguments;
        }
        return buildRoute(
            settings,
            BlocProvider<ContactDetailsBloc>(
              child: ContactDetailsScreen(contact: contact),
              bloc: contactDetailsBloc,
            ));
      case RoutesName.REVIEW_DOCUMENT_CAPTURE:
        List<String> listURL = new List();
        List<String> listName = new List();
        DocumentCaptureGroup document = settings.arguments;
        document.listDocumentCapture.forEach((element) {
          listURL.add(GeneralMethod.getImageURL(
              element.scannedPath, element.documentName));
          listName.add(element.documentName);
        });
        String idDocument = document.idDocumentContainer;
        ReviewDocumentBloc reviewDocumentBloc = new ReviewDocumentBloc();
        return buildRoute(
            settings,
            BlocProvider<ReviewDocumentBloc>(
              child: ReviewDocumentScreen(
                isLocalImage: false,
                listDocumentName: listName,
                listDocumentURL: listURL,
                idDocumentContainerScans: idDocument,
                documentName: document.listDocumentCapture[0].documentName,
                isMydmPage: false,
              ),
              bloc: reviewDocumentBloc,
            ));

      case RoutesName.REVIEW_DOCUMENT:
        List<DocumentAttachment> document = settings.arguments;
        List<String> listURL = new List();
        List<String> listName = new List();
        if (document != null && document.length > 0) {
          document.forEach((item) {
            listURL.add(
                GeneralMethod.getImageURL(item.scannedPath, item.fileName));
            listName.add(item.fileName);
          });
        }
        ReviewDocumentBloc reviewDocumentBloc = new ReviewDocumentBloc();
        return buildRoute(
            settings,
            BlocProvider<ReviewDocumentBloc>(
              child: ReviewDocumentScreen(
                isLocalImage: false,
                listDocumentName: listName,
                listDocumentURL: listURL,
                idDocumentContainerScans: document[0].idDocumentContainerScans,
                isMydmPage: true,
                folderName: document[0].documentType,
              ),
              bloc: reviewDocumentBloc,
            ));
      default:
        return null;
    }
  }
}

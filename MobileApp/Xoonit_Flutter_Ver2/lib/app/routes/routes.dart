import 'package:flutter/cupertino.dart';
import 'package:xoonit/app/ui/screen/capture/group_document_screen/group_document_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/group_document_screen/group_document_screen.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_screen.dart';
import 'package:xoonit/app/ui/screen/congratulation_screen.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_screen.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_screen.dart';
import 'package:xoonit/app/ui/screen/forgot_password/forgot_password.dart';
import 'package:xoonit/app/ui/screen/forgot_password/forgot_password_bloc.dart';
import 'package:xoonit/app/ui/screen/history/history_bloc.dart';
import 'package:xoonit/app/ui/screen/history/history_screen.dart';
import 'package:xoonit/app/ui/screen/login/login_bloc.dart';
import 'package:xoonit/app/ui/screen/login/login_screen.dart';
import 'package:xoonit/app/ui/screen/profiles/appearence/appearance.dart';
import 'package:xoonit/app/ui/screen/profiles/appearence/appearance_bloc.dart';
import 'package:xoonit/app/ui/screen/profiles/edit_password/edit_password.dart';
import 'package:xoonit/app/ui/screen/profiles/edit_password/edit_password_bloc.dart';
import 'package:xoonit/app/ui/screen/profiles/edit_profile/edit_profile.dart';
import 'package:xoonit/app/ui/screen/profiles/edit_profile/edit_profile_bloc.dart';
import 'package:xoonit/app/ui/screen/profiles/language/edit_language.dart';
import 'package:xoonit/app/ui/screen/profiles/language/edit_language_bloc.dart';
import 'package:xoonit/app/ui/screen/signup/signup_bloc.dart';
import 'package:xoonit/app/ui/screen/signup/signup_screen.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/routesbase.dart';

import '../ui/screen/cheat/all_common_component.dart';

class RoutesName {
  static const String LOGIN_SCREEN = "/login-screen";

  static const String HOME_SCREEN = "/home-screen";
  static const String CHEAT_SCREEN = "/cheat-screen";
  static const String HISTORY_SCREEN = "/history-screen";
  static const String SIGNUP_SCREEN = "/signup-screen";

  static const String FORGOT_PASSWORD_SCREEN = "/forgot-password-screen";
  static const String PROFILE_SCREEN = "/profile-screen";
  static const String CONGRATULATION_SCREEN = "/congratulation-screen";
  static const String CONTACT_DETAILS_SCREEN = "/contact-screen";
  static const String REVIEW_DOCUMENT_CAPTURE =
      "/capture/review-document-capture";
  static const String GROUP_CAPTURE = '/capture/group-capture';
  static const String REVIEW_DOCUMENT =
      "/mydms/review-document-capture";
  //Profile - Tab Me
  static const String EDIT_PROFILE_SCREEN = 'edit-profile-screen';
  static const String CHANGE_PROFILE = 'CHANGE_PROFILE';
  static const String CHANGE_PASSWORD = 'CHANGE_PASSWORD';
  static const String CHANGE_APPEARANCE = 'CHANGE_APPEARANCE';
  static const String CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
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
        SignupBloc signupBloc = new SignupBloc();
        return buildRoute(
            settings,
            BlocProvider<SignupBloc>(
              bloc: signupBloc,
              child: SignupScreen(),
            ));


      case RoutesName.FORGOT_PASSWORD_SCREEN:
        ForgotPasswordBloc forgotPasswordBloc = new ForgotPasswordBloc();
        return buildRoute(
            settings,
            BlocProvider<ForgotPasswordBloc>(
              bloc: forgotPasswordBloc,
              child: ForgotPasswordScreen(),
            ));
      case RoutesName.HISTORY_SCREEN:
        HistoryBloc historyBloc = new HistoryBloc();
        return buildRoute(
            settings,
            BlocProvider<HistoryBloc>(
              bloc: historyBloc,
              child: HistoryScreen(),
            ));
      case RoutesName.HOME_SCREEN:
        DashBoardBloc dashBoardBloc = new DashBoardBloc();
        return buildRoute(
            settings,
            BlocProvider<DashBoardBloc>(
              bloc: dashBoardBloc,
              child: DashBoardScreen(),
            ));
      case RoutesName.CHEAT_SCREEN:
        return buildRoute(settings, AllComponentUI());
      case RoutesName.CONGRATULATION_SCREEN:
        return buildRoute(settings, CongratulationScreen());

      case RoutesName.CONTACT_DETAILS_SCREEN:
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

      case RoutesName.REVIEW_DOCUMENT_CAPTURE:
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

      case RoutesName.REVIEW_DOCUMENT:
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

      case RoutesName.GROUP_CAPTURE:
        String idDocumentContainerScans = "";
        if (settings.arguments != null) {
          idDocumentContainerScans = settings.arguments;
        }
        return buildRoute(
            settings,
            BlocProvider<GroupDocumentBloc>(
              child: GroupDocumentScreen(),
              bloc: GroupDocumentBloc(idDocumentContainerScans),
            ));
//EDIT PROFILE
      case RoutesName.CHANGE_PROFILE:
        return buildRoute(
            settings,
            BlocProvider<EditProfileBloc>(
              bloc: EditProfileBloc(),
              child: ChangeProfileScreen(),
            ));
      case RoutesName.CHANGE_PASSWORD:
        return buildRoute(
            settings,
            BlocProvider<EditPasswordBloc>(
              bloc: EditPasswordBloc(),
              child: ChangePasswordScreen(),
            ));
      case RoutesName.CHANGE_APPEARANCE:
        return buildRoute(
            settings,
            BlocProvider<AppearanceBloc>(
              bloc: AppearanceBloc(),
              child: ChangeAppearanceScreen(),
            ));
      case RoutesName.CHANGE_LANGUAGE:
        return buildRoute(
            settings,
            BlocProvider<EditLanguageBloc>(
              bloc: EditLanguageBloc(),
              child: ChangeLanguageScreen(),
            ));
      default:
        return null;
    }
  }
}

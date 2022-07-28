import 'package:flutter/material.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/core/bloc_base.dart';

class ProfilesBloc extends BlocBase {
  @override
  void dispose() {}
  void changProfile() {
    AppMaster.globalNavigatorKey.currentState.pushNamed(RoutesName.CHANGE_PROFILE);
  }

  void changPassword() {
    AppMaster.globalNavigatorKey.currentState.pushNamed(RoutesName.CHANGE_PASSWORD);
  }

  void changeAppearance() {
    AppMaster.globalNavigatorKey.currentState.pushNamed(RoutesName.CHANGE_APPEARANCE);
  }

  void changeLanguage() {
    AppMaster.globalNavigatorKey.currentState.pushNamed(RoutesName.CHANGE_LANGUAGE);
  }

  void logOut(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext _context) {
          return NotificationDialog(
            iconImages: Image.asset(Resources.icDialogWarning),
            title: "Warning !",
            message: "Are you sure want to log out ?",
            possitiveButtonName: "OK",
            possitiveButtonOnClick: (_) {
              AppMaster.globalNavigatorKey.currentState.pushNamedAndRemoveUntil(
                  RoutesName.LOGIN_SCREEN, (route) => false);
            },
            negativeButtonName: "Cancel",
            nagativeButtonOnCLick: (_) {
              Navigator.of(_context).pop();
            },
            body: SizedBox.shrink(),
          );
        });
  }
}

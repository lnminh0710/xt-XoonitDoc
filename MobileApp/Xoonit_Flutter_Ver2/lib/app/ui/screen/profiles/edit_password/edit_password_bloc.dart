import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/profile/change_password_request.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class EditPasswordBloc extends BlocBase {
  @override
  void dispose() {}

  Future<bool> saveChangePassword(BuildContext context, String oldPassword,
      String newPassword, String repeatPassword) async {
    bool isChangePasswordSuccess = false;
    if (isNewPassIndifferently(oldPassword, newPassword)) {
      if (isRepeatPasswordCorrectly(newPassword, repeatPassword)) {
        ChangePasswordRequest request = ChangePasswordRequest(
            password: oldPassword,
            newPassword: newPassword,
            currentDateTime: DateTime.now().toIso8601String());
        var response =
            await appApiService.client.changePassword(request.toJson());

        if (response.item != null && response.item.accessToken != null) {
          GeneralMethod.saveUserInfo(response.item.accessToken,
              response.item.refreshToken, response.item.expiresIn);

          isChangePasswordSuccess = true;
        } else {
          showDialogFailed(context, "Change password failed !");
        }
      } else {
        showDialogFailed(context, "Repeat passwords is not match");
      }
    } else {
      showDialogFailed(context, "The new password is the same as the old one");
    }
    return isChangePasswordSuccess;
  }

  bool isNewPassIndifferently(String oldPassword, String newPassword) {
    return oldPassword != newPassword ? true : false;
  }

  bool isRepeatPasswordCorrectly(String newPassword, String repeatPassword) {
    return newPassword == repeatPassword ? true : false;
  }

  void showDialogFailed(BuildContext context, String message) {
    showDialog(
        context: context,
        builder: (_context) {
          return NotificationDialog(
              iconImages: Image.asset(Resources.icDialogWarning),
              title: "Notice !",
              message: message,
              possitiveButtonName: "OK",
              possitiveButtonOnClick: (_) {
                Navigator.of(_context).pop();
              });
        });
  }
}

import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/contact/contact_detail_response.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/core/bloc_base.dart';

class ContactDetailsBloc extends BlocBase {
  final BehaviorSubject<ContactDetailResponse> _contactDetailResponse =
      BehaviorSubject.seeded(null);

  Stream<ContactDetailResponse> get contactDetail =>
      _contactDetailResponse.stream;

  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject.seeded(AppState.Idle);

  Stream<AppState> get screenState => _screenState.stream;

  final String idPerson;
  final String idPersonType;
  @override
  void dispose() {
    closeStream();
  }

  ContactDetailsBloc({this.idPerson, this.idPersonType}) {
    initDataContact();
  }

  closeStream() {
    _contactDetailResponse?.close();
    _screenState?.close();
  }

  initDataContact() {
    _screenState.sink.add(AppState.Loading);
    appApiService.client
        .getContactDetailsById(idPersonType, idPerson)
        .then((value) {
      _contactDetailResponse.sink.add(value);
      _screenState.sink.add(AppState.Idle);
    }).catchError((onError) {
      _screenState.sink.add(AppState.Idle);
    });
  }

  saveContactDetails(BuildContext mainContext,
      ContactDetailResponse contactDetailResponse) async {
    _screenState.sink.add(AppState.Loading);

    if (contactDetailResponse?.contactDetailItems != null) {
      Map<String, String> request = Map<String, String>();
      contactDetailResponse.contactDetailItems.forEach((element) {
        request[element.originalColumnName] = element.value;
      });
      await appApiService.client.saveContactDetails(request).then((value) => {
            _screenState.sink.add(AppState.Idle),
            if (value?.item != null && value.item > 0)
              {
                showDialog(
                  context: mainContext,
                  builder: (context) {
                    return NotificationDialog(
                      iconImages: Image.asset(Resources.icDialogWarning),
                      title: "Notice !",
                      message: "Save contact successfully !",
                      possitiveButtonName: "Ok",
                      possitiveButtonOnClick: (_) {
                        Navigator.of(context).pop();
                      },
                      body: SizedBox.shrink(),
                    );
                  },
                ),
              }
            else
              {_showDialogFailToSaveContact(mainContext)}
          });
    } else {
      _screenState.sink.add(AppState.Idle);
      _showDialogFailToSaveContact(mainContext);
    }
  }

  _showDialogFailToSaveContact(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return NotificationDialog(
          iconImages: Image.asset(Resources.icDialogWarning),
          title: "Notice !",
          message: "Save contact failed !",
          possitiveButtonName: "Ok",
          possitiveButtonOnClick: (_) {
            Navigator.of(context).pop();
          },
          body: SizedBox.shrink(),
        );
      },
    );
  }
}

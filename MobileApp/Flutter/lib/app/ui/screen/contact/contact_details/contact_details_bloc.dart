import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/app/model/remote/save_contact_request.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/core/bloc_base.dart';

class ContactDetailsBloc extends BlocBase {
  final BehaviorSubject<List<AttachmentContactItem>> _listAttachmentContact =
  BehaviorSubject.seeded(null);

  Stream<List<AttachmentContactItem>> get listAttachmentContact =>
      _listAttachmentContact.stream;

  final BehaviorSubject<Contact> _contact = BehaviorSubject.seeded(null);

  Stream<Contact> get contact => _contact.stream;

  final BehaviorSubject<bool> _disableEditing = BehaviorSubject.seeded(true);

  Stream<bool> get disableEditing => _disableEditing.stream;

  final BehaviorSubject<AppState> _screenState =
  BehaviorSubject.seeded(AppState.Idle);

  Stream<AppState> get screenState => _screenState.stream;

  final BehaviorSubject<bool> _isShowingKeyBoard = BehaviorSubject.seeded(false);
  Stream<bool> get isShowingKeyBoard => _isShowingKeyBoard.stream;

  @override
  void dispose() {
    closeStream();
  }

  closeStream() {
    _listAttachmentContact?.close();
    _contact?.close();
    _disableEditing?.close();
    _screenState?.close();
    _isShowingKeyBoard?.close();
  }

  initDataContact(Contact contact) {
    if (contact != null && contact.idPerson != null) {
      getListAttachmentContacts(contact.idPerson);
      _contact.sink.add(contact);
    }
  }

  getListAttachmentContacts(String idPerson) async {
    await appApiService.client
        .getAttachmentListByContact(idPerson)
        .then((value) {
      if (value != null &&
          value.listAttachment != null &&
          value.listAttachment.length > 0) {
        _listAttachmentContact.sink.add(value.listAttachment);
      }
    });
  }

  onDisableEditing(bool disableEditing) {
    _disableEditing.sink.add(disableEditing);
  }
  
  onShowingKeyBoard(bool isShowing) {
    _isShowingKeyBoard.sink.add(isShowing);
  }
  saveContactDetails(BuildContext context,
      SaveContactRequest saveContactRequest) async {
    _screenState.sink.add(AppState.Loading);
    await appApiService.client
        .saveContactDetails(saveContactRequest.toJson())
        .then((value) =>
    {
      _screenState.sink.add(AppState.Idle),
      if (value != null &&
          value.item != null &&
          value.item.isSuccess != null &&
          value.item.isSuccess)
        {
          showDialog(
            context: context,
            builder: (context) {
              return DialogMessage(
                title: "Notification",
                message: "Save contact successfully !",
                onOKButtonPressed: () {
                  Navigator.of(context).pop();
                },
              );
            },
          ),
        }
      else
        {
          showDialog(
            context: context,
            builder: (context) {
              return DialogMessage(
                title: "Notification",
                message: "Save contact failed !",
                onOKButtonPressed: () {
                  Navigator.of(context).pop();
                },
              );
            },
          )
        }
    });
    _disableEditing.sink.add(true);
  }
}

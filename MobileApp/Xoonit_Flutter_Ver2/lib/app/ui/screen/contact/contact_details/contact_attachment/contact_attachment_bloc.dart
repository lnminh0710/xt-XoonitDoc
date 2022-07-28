import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class ContactAttachmentBloc extends BlocBase {
  final BehaviorSubject<AttachmentContactItem> _attachmentContact =
      BehaviorSubject.seeded(null);

  Stream<AttachmentContactItem> get attachmentContact =>
      _attachmentContact.stream;

  final BehaviorSubject<bool> _loadingMoreController =
      BehaviorSubject.seeded(false);

  Stream<bool> get loadingMoreStream => _loadingMoreController.stream;

  final String idPerson;

  int _pageIndex = 1;
  int _pageSize = 10;
  int _total = 0;
  String _idPersion;
  @override
  void dispose() {
    closeStream();
  }

  ContactAttachmentBloc({@required this.idPerson}) {
    getListAttachmentContacts(idPerson);
  }

  closeStream() {
    _attachmentContact?.close();
    _loadingMoreController?.close();
  }

  Future<void> refresh() async {
    _pageIndex = 1;
    _attachmentContact.sink.add(null);
    await XoonitApplication.instance
        .getGlobalSearchController()
        .searchAttachmentContact(idPerson, _pageIndex, _pageSize)
        .then((value) {
      if (value != null && value.item != null) {
        _attachmentContact.sink.add(value.item);
      }
    });
  }

  getListAttachmentContacts(String idPerson) {
    _idPersion = idPerson;
    _attachmentContact.sink.add(null);
    XoonitApplication.instance
        .getGlobalSearchController()
        .searchAttachmentContact(idPerson, _pageIndex, _pageSize)
        .then((value) {
      if (value != null && value.item != null) {
        _attachmentContact.sink.add(value.item);
      }
    });
  }

  Future<void> loadmoreListAttachmentContacts() async {
    if (_loadingMoreController.value == true) {
      return;
    }
    _loadingMoreController.sink.add(true);
    if (_pageIndex * _pageSize < _total) {
      _pageIndex = _pageIndex + 1;
      AttachmentContact attachmentContact = await XoonitApplication.instance
          .getGlobalSearchController()
          .searchAttachmentContact(_idPersion, _pageIndex, _pageSize);
      if (attachmentContact?.item?.results != null) {
        if (_attachmentContact?.value?.results != null) {
          _attachmentContact.value.results
              .addAll(attachmentContact.item.results);
        } else {
          _attachmentContact.value.results = attachmentContact.item.results;
        }
        _total = attachmentContact.item.total;
        _attachmentContact.sink.add(_attachmentContact.value);
      }
    }
    _loadingMoreController.sink.add(false);
  }
}

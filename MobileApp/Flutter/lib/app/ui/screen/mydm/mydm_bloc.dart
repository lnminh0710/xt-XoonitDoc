import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../app.dart';

class MyDMBloc extends BlocBase {
  final BehaviorSubject<List<SearchDocumentResult>> _searchDocumentResultList =
      BehaviorSubject<List<SearchDocumentResult>>.seeded(null);
  Stream<List<SearchDocumentResult>> get searchDocumentResultList =>
      _searchDocumentResultList.stream;

  MyDMBloc({int idDocumentTree}) {
    searchDocumentByIdDocumentTree(idDocumentTree);
  }
  void refreshSearchDocumentResultList(
      List<SearchDocumentResult> searchDocumentResultList) {
    _searchDocumentResultList.sink.add(searchDocumentResultList);
  }

  void searchDocumentByIdDocumentTree(int idDocumentTree) {
    _searchDocumentResultList.sink.add(null);
    appApiService.client
        .searchDocumentInFolder(idDocumentTree, 1)
        .then((onValue) {
      if (onValue != null &&
          onValue?.item != null &&
          onValue?.item?.results != null) {
        _searchDocumentResultList.sink.add(onValue.item.results);
      }
    });
  }

  void onReviewDocumentInMyDM(
      BuildContext context, String idDocumentContainerScans) async {
    await appApiService.client
        .getDocumentPagesById(idDocumentContainerScans)
        .then((value) {
      List<DocumentAttachment> document = value;
      AppMaster.navigatorKey.currentState
          .pushNamed(RoutesName.REVIEW_DOCUMENT, arguments: document);
    });
  }

  @override
  void dispose() {
    _searchDocumentResultList?.close();
  }
}

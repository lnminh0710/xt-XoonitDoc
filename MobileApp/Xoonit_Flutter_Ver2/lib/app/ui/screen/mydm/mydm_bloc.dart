import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../app.dart';

class MyDMBloc extends BlocBase {
  final BehaviorSubject<List<SearchDocumentResult>> _searchDocumentResultList =
      BehaviorSubject<List<SearchDocumentResult>>.seeded(null);
  Stream<List<SearchDocumentResult>> get searchDocumentResultList =>
      _searchDocumentResultList.stream;

  final BehaviorSubject<int> _totalItemController =
      BehaviorSubject<int>.seeded(null);
  Stream<int> get totalDocumentStream => _totalItemController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  int _currentIdDocumentTree;
  int _pageSize = 20;
  int _pageIndex = 1;
  MyDMBloc({int idDocumentTree}) {
    searchDocumentByIdDocumentTree(idDocumentTree);
  }
  void refreshSearchDocumentResultList() {
    // _searchDocumentResultList.sink.add(searchDocumentResultList);
  }

  void searchDocumentByIdDocumentTree(int idDocumentTree) {
    _searchDocumentResultList.sink.add(List<SearchDocumentResult>());
    _currentIdDocumentTree = idDocumentTree;
    _pageIndex = 1;
    _searchDocumentByIdDocumentTree(idDocumentTree, _pageIndex, _pageSize);
  }

  Future<void> _searchDocumentByIdDocumentTree(
      int idDocumentTree, int pageIndex, int pageSize) async {
    await appApiService.client
        .searchDocumentInFolder(idDocumentTree, pageIndex, pageSize)
        .then((onValue) {
      if (onValue != null &&
          onValue?.item != null &&
          onValue?.item?.results != null) {
        _searchDocumentResultList.value.addAll(onValue.item.results);
        _searchDocumentResultList.sink.add(_searchDocumentResultList.value);
        _totalItemController.sink.add(onValue.item?.total ?? 0);
      }
    });
  }

  Future<void> loadMoreDocument() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_searchDocumentResultList.value.length < _totalItemController.value) {
      _pageIndex++;
      await _searchDocumentByIdDocumentTree(
          _currentIdDocumentTree, _pageIndex, _pageSize);
    }
    _loadingController.sink.add(false);
  }

  void onReviewDocumentInMyDM(BuildContext context,
      String idDocumentContainerScans, DashBoardBloc dashBoardBloc) async {
    dashBoardBloc.jumpToScreen(EHomeScreenChild.reviewDocument,
        args: idDocumentContainerScans);
  }

  @override
  void dispose() {
    _searchDocumentResultList?.close();
    _totalItemController?.close();
    _loadingController?.close();
  }
}

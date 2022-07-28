import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/model/remote/global_search/todo_document_detail_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchTodoDocumentDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<SearchTodoDocumentDetailResponse>
      _searchTodoDocumentResponseController = BehaviorSubject.seeded(null);

  Stream<SearchTodoDocumentDetailResponse>
      get searcTodoDocumentResponseStream =>
          _searchTodoDocumentResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  SearchTodoDocumentDetailBloc({this.keywordSearch}) {
    searchTodoDocument(keywordSearch ?? '', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreTodoDocumentDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      SearchTodoDocumentDetailResponse searchTodoDocumentResponse =
          await XoonitApplication.instance
              .getGlobalSearchController()
              .searchTodoDocument(keywordSearch, _defaultPageSize, _pageIndex);
      if (searchTodoDocumentResponse != null &&
          searchTodoDocumentResponse?.item?.results != null) {
        if (_searchTodoDocumentResponseController?.value?.item?.results !=
            null) {
          _searchTodoDocumentResponseController.value.item.results
              .addAll(searchTodoDocumentResponse.item.results);
        }
        _total = searchTodoDocumentResponse.item.total;
        _searchTodoDocumentResponseController.sink
            .add(_searchTodoDocumentResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<SearchTodoDocumentDetailResponse> searchTodoDocument(
      String keywordSearch, int pageSize, int pageIndex) async {
    SearchTodoDocumentDetailResponse searchTodoDocumentDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchTodoDocument(keywordSearch, pageSize, pageIndex);
    if (searchTodoDocumentDetailResponse != null) {
      _searchTodoDocumentResponseController.sink
          .add(searchTodoDocumentDetailResponse);
      _total = searchTodoDocumentDetailResponse?.item?.total ?? 0;
    }
    return searchTodoDocumentDetailResponse;
  }

  reviewDocument(
      BuildContext context,
      SearchTodoDocumentResult searchTodoDocumentResult,
      DashBoardBloc dashBoardBloc) {
    dashBoardBloc.jumpToScreen(EHomeScreenChild.reviewDocument,
        args: searchTodoDocumentResult.idDocumentContainerScans);
  }

  @override
  void dispose() {
    _searchTodoDocumentResponseController?.close();
    _loadingController?.close();
  }
}

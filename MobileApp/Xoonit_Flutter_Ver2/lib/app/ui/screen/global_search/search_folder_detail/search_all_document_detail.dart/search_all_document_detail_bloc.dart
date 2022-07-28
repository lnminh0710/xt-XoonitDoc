import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/model/remote/global_search/search_all_document_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_capture_detail_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchAllDocumentDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<SearchAllDocumentResponse>
      _searchAllDocumentResponseController = BehaviorSubject.seeded(null);

  Stream<SearchAllDocumentResponse> get searcAllDocumentResponseStream =>
      _searchAllDocumentResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  SearchAllDocumentDetailBloc({this.keywordSearch}) {
    searchCapture(keywordSearch ?? '', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreSearchAllDocumentDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      SearchAllDocumentResponse searchAllDocumentResponse =
          await XoonitApplication.instance
              .getGlobalSearchController()
              .searchAllDocument(keywordSearch, _defaultPageSize, _pageIndex);
      if (searchAllDocumentResponse != null &&
          searchAllDocumentResponse?.item?.results != null) {
        if (_searchAllDocumentResponseController?.value?.item?.results !=
            null) {
          _searchAllDocumentResponseController.value.item.results
              .addAll(searchAllDocumentResponse.item.results);
        }
        _total = searchAllDocumentResponse.item.total;
        _searchAllDocumentResponseController.sink
            .add(_searchAllDocumentResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<SearchAllDocumentResponse> searchCapture(
      String keywordSearch, int pageSize, int pageIndex) async {
    SearchAllDocumentResponse searchAllDocumentDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchAllDocument(keywordSearch, pageSize, pageIndex);
    if (searchAllDocumentDetailResponse != null) {
      _searchAllDocumentResponseController.sink
          .add(searchAllDocumentDetailResponse);
      _total = searchAllDocumentDetailResponse?.item?.total ?? 0;
    }
    return searchAllDocumentDetailResponse;
  }

  reviewDocument(
      BuildContext context,
      SearchAllDocumentResult searchAllDocumentResult,
      DashBoardBloc dashBoardBloc) {
    dashBoardBloc.jumpToScreen(EHomeScreenChild.reviewDocument,
        args: searchAllDocumentResult.idDocumentContainerScans);
  }

  @override
  void dispose() {
    _searchAllDocumentResponseController?.close();
    _loadingController?.close();
  }
}

import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/model/remote/global_search/search_other_document_detail_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchOtherDocumentDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<SearchOtherDocumentDetailResponse>
      _searchOtherDocumentResponseController = BehaviorSubject.seeded(null);

  Stream<SearchOtherDocumentDetailResponse>
      get searcOtherDocumentResponseStream =>
          _searchOtherDocumentResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  SearchOtherDocumentDetailBloc({this.keywordSearch}) {
    searchOtherDocument(keywordSearch ?? '', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreOtherDocumentDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      SearchOtherDocumentDetailResponse searchOtherDocumentResponse =
          await XoonitApplication.instance
              .getGlobalSearchController()
              .searchOtherDocument(keywordSearch, _defaultPageSize, _pageIndex);
      if (searchOtherDocumentResponse != null &&
          searchOtherDocumentResponse?.item?.results != null) {
        if (_searchOtherDocumentResponseController?.value?.item?.results !=
            null) {
          _searchOtherDocumentResponseController.value.item.results
              .addAll(searchOtherDocumentResponse.item.results);
        }
        _total = searchOtherDocumentResponse.item.total;
        _searchOtherDocumentResponseController.sink
            .add(_searchOtherDocumentResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<SearchOtherDocumentDetailResponse> searchOtherDocument(
      String keywordSearch, int pageSize, int pageIndex) async {
    SearchOtherDocumentDetailResponse searchOtherDocumentDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchOtherDocument(keywordSearch, pageSize, pageIndex);
    if (searchOtherDocumentDetailResponse != null) {
      _searchOtherDocumentResponseController.sink
          .add(searchOtherDocumentDetailResponse);
      _total = searchOtherDocumentDetailResponse?.item?.total ?? 0;
    }
    return searchOtherDocumentDetailResponse;
  }

  reviewDocument(
      BuildContext context,
      OtherDocumentResult searchOtherDocumentResult,
      DashBoardBloc dashBoardBloc) {
   dashBoardBloc.jumpToScreen(EHomeScreenChild.reviewDocument, args:  searchOtherDocumentResult.idDocumentContainerScans);
  }

  @override
  void dispose() {
    _searchOtherDocumentResponseController?.close();
    _loadingController?.close();
  }
}

import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/model/remote/global_search/search_capture_detail_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchCaptureDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<SearchCaptureDetailResponse>
      _searchCaptureResponseController = BehaviorSubject.seeded(null);

  Stream<SearchCaptureDetailResponse> get searchCaptureResponseStream =>
      _searchCaptureResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  SearchCaptureDetailBloc({this.keywordSearch}) {
    searchCapture(keywordSearch ?? '', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreSearchCaptureDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      SearchCaptureDetailResponse searchCaptureDetailResponse =
          await XoonitApplication.instance
              .getGlobalSearchController()
              .searchCapture(keywordSearch, _defaultPageSize, _pageIndex);
      if (searchCaptureDetailResponse != null &&
          searchCaptureDetailResponse?.item?.results != null) {
        if (_searchCaptureResponseController?.value?.item?.results != null) {
          _searchCaptureResponseController.value.item.results
              .addAll(searchCaptureDetailResponse.item.results);
        }
        _total = searchCaptureDetailResponse.item.total;
        _searchCaptureResponseController.sink
            .add(_searchCaptureResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<SearchCaptureDetailResponse> searchCapture(
      String keywordSearch, int pageSize, int pageIndex) async {
    SearchCaptureDetailResponse searchCaptureDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchCapture(keywordSearch, pageSize, pageIndex);
    if (searchCaptureDetailResponse != null) {
      _searchCaptureResponseController.sink.add(searchCaptureDetailResponse);
      _total = searchCaptureDetailResponse?.item?.total ?? 0;
    }
    return searchCaptureDetailResponse;
  }

  void reviewCapture(BuildContext context, CaptureSearchResult captureSearch,
      DashBoardBloc dashBoardBloc) {
    dashBoardBloc
        .jumpToScreen(EHomeScreenChild.reviewCapture,
            args: captureSearch.idDocumentContainerScans.toString())
        .then((value) {
      if (value is bool && value == true) {
        _searchCaptureResponseController.value.item.results
            .remove(captureSearch);
        _total = _searchCaptureResponseController.value.item.results.length;
        _searchCaptureResponseController.sink
            .add(_searchCaptureResponseController.value);
      }
    });
  }

  @override
  void dispose() {
    _searchCaptureResponseController?.close();
    _loadingController?.close();
  }
}

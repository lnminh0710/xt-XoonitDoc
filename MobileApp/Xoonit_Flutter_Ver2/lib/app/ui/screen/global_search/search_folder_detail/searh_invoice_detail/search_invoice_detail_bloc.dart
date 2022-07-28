import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/model/remote/global_search/search_invoice_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchInvoiceDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<SearchInvoiceResponse>
      _searchInvoiceResponseController = BehaviorSubject.seeded(null);

  Stream<SearchInvoiceResponse> get searcInvoiceResponseStream =>
      _searchInvoiceResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  SearchInvoiceDetailBloc({this.keywordSearch}) {
    searchInvoice(keywordSearch ?? '', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreSearchInvoiceDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      SearchInvoiceResponse searchInvoiceResponse = await XoonitApplication
          .instance
          .getGlobalSearchController()
          .searchInvoice(keywordSearch, _defaultPageSize, _pageIndex);
      if (searchInvoiceResponse != null &&
          searchInvoiceResponse?.item?.results != null) {
        if (_searchInvoiceResponseController?.value?.item?.results != null) {
          _searchInvoiceResponseController.value.item.results
              .addAll(searchInvoiceResponse.item.results);
        }
        _total = searchInvoiceResponse.item.total;
        _searchInvoiceResponseController.sink
            .add(_searchInvoiceResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<SearchInvoiceResponse> searchInvoice(
      String keywordSearch, int pageSize, int pageIndex) async {
    SearchInvoiceResponse searchInvoiceDetailResponse = await XoonitApplication
        .instance
        .getGlobalSearchController()
        .searchInvoice(keywordSearch, pageSize, pageIndex);
    if (searchInvoiceDetailResponse != null) {
      _searchInvoiceResponseController.sink.add(searchInvoiceDetailResponse);
      _total = searchInvoiceDetailResponse?.item?.total ?? 0;
    }
    return searchInvoiceDetailResponse;
  }

  reviewDocument(BuildContext context, SearchInvoiceResult searchInvoiceResult,
      DashBoardBloc dashBoardBloc) {
   dashBoardBloc.jumpToScreen(EHomeScreenChild.reviewDocument, args:  searchInvoiceResult.idDocumentContainerScans);
  }

  @override
  void dispose() {
    _searchInvoiceResponseController?.close();
    _loadingController?.close();
  }
}

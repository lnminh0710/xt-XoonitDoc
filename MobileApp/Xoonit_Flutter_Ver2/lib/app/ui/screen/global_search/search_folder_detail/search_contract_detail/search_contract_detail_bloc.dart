import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/model/remote/global_search/search_contract_detail_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchContractDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<ContractSearchDetailResponse>
      _searchContractResponseController = BehaviorSubject.seeded(null);

  Stream<ContractSearchDetailResponse> get searcContractResponseStream =>
      _searchContractResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  SearchContractDetailBloc({this.keywordSearch}) {
    searchContract(keywordSearch ?? '', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreSearchContractDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      ContractSearchDetailResponse contractSearchDetailResponse =
          await XoonitApplication.instance
              .getGlobalSearchController()
              .searchContract(keywordSearch, _defaultPageSize, _pageIndex);
      if (contractSearchDetailResponse != null &&
          contractSearchDetailResponse?.item?.results != null) {
        if (_searchContractResponseController?.value?.item?.results != null) {
          _searchContractResponseController.value.item.results
              .addAll(contractSearchDetailResponse.item.results);
        }
        _total = contractSearchDetailResponse.item.total;
        _searchContractResponseController.sink
            .add(_searchContractResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<ContractSearchDetailResponse> searchContract(
      String keywordSearch, int pageSize, int pageIndex) async {
    ContractSearchDetailResponse searchContractDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchContract(keywordSearch, pageSize, pageIndex);
    if (searchContractDetailResponse != null) {
      _searchContractResponseController.sink.add(searchContractDetailResponse);
      _total = searchContractDetailResponse?.item?.total ?? 0;
    }
    return searchContractDetailResponse;
  }

  reviewDocument(BuildContext context,
      SearchContractResult searchContractResult, DashBoardBloc dashBoardBloc) {
   dashBoardBloc.jumpToScreen(EHomeScreenChild.reviewDocument, args:  searchContractResult.idDocumentContainerScans);
  }

  @override
  void dispose() {
    _searchContractResponseController?.close();
    _loadingController?.close();
  }
}

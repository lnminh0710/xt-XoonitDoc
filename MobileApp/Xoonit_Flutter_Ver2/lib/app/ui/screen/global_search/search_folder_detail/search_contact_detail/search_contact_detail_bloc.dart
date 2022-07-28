import 'package:flutter/cupertino.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchContactDetailBloc extends BlocBase {
  String keywordSearch;
  int _defaultPageSize = 10;
  int _pageIndex = 1;
  int _total = 0;

  final BehaviorSubject<ContactSearchDetailResponse>
      _searchContactResponseController = BehaviorSubject.seeded(null);

  Stream<ContactSearchDetailResponse> get searchContactResponseStream =>
      _searchContactResponseController.stream;

  final BehaviorSubject<bool> _loadingController = BehaviorSubject.seeded(null);

  Stream<bool> get loadingStream => _loadingController.stream;

  final BehaviorSubject<AppState> _appState = BehaviorSubject.seeded(null);

  Stream<AppState> get appState => _appState.stream;

  SearchContactDetailBloc({this.keywordSearch}) {
    _searchContact(keywordSearch ?? '*', _defaultPageSize, _pageIndex);
  }

  int getTotalResult() {
    return _total;
  }

  Future<void> loadMoreSearchContactDetail() async {
    if (_loadingController.value == true) {
      return;
    }
    _loadingController.sink.add(true);
    if (_pageIndex * _defaultPageSize < _total) {
      _pageIndex = _pageIndex + 1;
      ContactSearchDetailResponse searchContactDetailResponse =
          await XoonitApplication.instance
              .getGlobalSearchController()
              .searchContact(keywordSearch, _defaultPageSize, _pageIndex);
      if (searchContactDetailResponse != null &&
          searchContactDetailResponse?.item?.listContacts != null) {
        if (_searchContactResponseController?.value?.item?.listContacts !=
            null) {
          _searchContactResponseController.value.item.listContacts
              .addAll(searchContactDetailResponse.item.listContacts);
        }
        _total = searchContactDetailResponse.item.total;
        _searchContactResponseController.sink
            .add(_searchContactResponseController.value);
      }
    }
    _loadingController.sink.add(false);
  }

  Future<ContactSearchDetailResponse> searchContact(
      String _keywordSearch) async {
    _searchContactResponseController.sink.add(null);
    _pageIndex = 1;
    keywordSearch = _keywordSearch;
    ContactSearchDetailResponse searchContactDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchContact(keywordSearch, _defaultPageSize, _pageIndex);
    if (searchContactDetailResponse != null) {
      _searchContactResponseController.sink.add(searchContactDetailResponse);
      _total = searchContactDetailResponse?.item?.total ?? 0;
    }
    return searchContactDetailResponse;
  }

  Future<ContactSearchDetailResponse> _searchContact(
      String keywordSearch, int pageSize, int pageIndex) async {
    ContactSearchDetailResponse searchContactDetailResponse =
        await XoonitApplication.instance
            .getGlobalSearchController()
            .searchContact(keywordSearch, pageSize, pageIndex);
    if (searchContactDetailResponse != null) {
      _searchContactResponseController.sink.add(searchContactDetailResponse);
      _total = searchContactDetailResponse?.item?.total ?? 0;
    }
    return searchContactDetailResponse;
  }

  void pullContact() {
    searchContact(keywordSearch);
  }

  openContactDetail(BuildContext context, String idPerson, String idPersonType,
      DashBoardBloc dashBoardBloc) {
    Map<String, String> argument = {
      'idPerson': idPerson,
      'idPersonType': idPersonType
    };
    dashBoardBloc.jumpToScreen(EHomeScreenChild.contactDetails, args: argument);
  }

  @override
  void dispose() {
    _searchContactResponseController?.close();
    _loadingController?.close();
    _appState?.close();
  }
}

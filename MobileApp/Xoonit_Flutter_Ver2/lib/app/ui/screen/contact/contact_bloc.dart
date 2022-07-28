import 'dart:async';

import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/ui/component/appbar_top_component.dart';
import 'package:xoonit/core/bloc_base.dart';

class ContactBloc extends BlocBase implements AppBarSearchDelegate {
  final int defaultPageSize = 20;
  final int defaultPageIndex = 1;
  final String defaultSearchKey = "*";
  String mSearchKey = "*";
  int totalItem = 0;
  Timer timer;

  //delay to handle changed of search,pageSize, pageIndex
  final int delaySearch = 1;

  final BehaviorSubject<List<ContactSearchResult>> _contactsList =
      BehaviorSubject.seeded(null);

  Stream<List<ContactSearchResult>> get contactsList => _contactsList.stream;

  final BehaviorSubject<AppState> _appState =
      BehaviorSubject.seeded(AppState.Loading);

  Stream<AppState> get appState => _appState.stream;

  final onSearchChanged = BehaviorSubject<String>();

  final BehaviorSubject<bool> _isLoadingMore = BehaviorSubject.seeded(false);
  Stream<bool> get isLoadingMore => _isLoadingMore.stream;
  final BehaviorSubject<int> _currentPageIndex = BehaviorSubject.seeded(1);

  Stream<int> get currentPageIndex => _currentPageIndex.stream;

  final BehaviorSubject<int> _totalContact = BehaviorSubject.seeded(0);

  Stream<int> get totalContact => _totalContact.stream;
  final BehaviorSubject<int> _currentPageSize = BehaviorSubject.seeded(20);

  Stream<int> get currentPageSize => _currentPageSize.stream;

  final BehaviorSubject<int> _maxPageIndex = BehaviorSubject.seeded(99);

  Stream<int> get maxPageIndex => _maxPageIndex.stream;

  final BehaviorSubject<bool> _isShowingKeyBoard =
      BehaviorSubject.seeded(false);
  Stream<bool> get isShowingKeyBoard => _isShowingKeyBoard.stream;

  @override
  void dispose() {}

  void closeStream() {
    _contactsList.close();
    _appState.close();
    _currentPageIndex.close();
    _currentPageSize.close();
    _maxPageIndex.close();
    _isShowingKeyBoard.close();
    _isLoadingMore?.close();
    _totalContact?.close();
  }

  ContactBloc() {
    getContactsList(
        defaultSearchKey, _currentPageIndex.value, _currentPageSize.value);
    onSearchChanged
        .debounceTime(Duration(seconds: delaySearch))
        .listen((searchKey) {
      if (searchKey == "" ||
          onSearchChanged.value == null ||
          onSearchChanged.value == "") {
        searchKey = defaultSearchKey;
      }
      _currentPageIndex.sink.add(1);
      mSearchKey = searchKey;
      getContactsList(
          searchKey, _currentPageIndex.value, _currentPageSize.value);
    });
    _isShowingKeyBoard.sink.add(false);
  }

  void onNextPage() {
    if (_currentPageIndex.value != null &&
        (_currentPageIndex.value + 1) <= _maxPageIndex.value) {
      _currentPageIndex.sink.add(_currentPageIndex.value + 1);
      getContactsList(onSearchChanged.value, _currentPageIndex.value,
          _currentPageSize.value);
    }
  }

  void onPreviousPage() {
    if (_currentPageIndex.value != null && (_currentPageIndex.value - 1) > 0) {
      _currentPageIndex.sink.add(_currentPageIndex.value - 1);
      getContactsList(onSearchChanged.value, _currentPageIndex.value,
          _currentPageSize.value);
    }
  }

  void onGetContactWithPageSize(int pageSize) {
    timer?.cancel();
    timer = Timer(Duration(seconds: delaySearch), () {
      printLog("Page Size: $pageSize");
      getContactsWithPageSize(pageSize);
    });
  }

  void getContactsWithPageSize(int pageSize) {
    if (pageSize != null && pageSize > 0) {
      _currentPageSize.sink.add(pageSize);
      _currentPageIndex.sink.add(defaultPageIndex);
      getContactsList(onSearchChanged.value, _currentPageIndex.value,
          _currentPageSize.value);
    } else {
      _currentPageSize.sink.add(defaultPageSize);
      _currentPageIndex.sink.add(defaultPageIndex);
      getContactsList(onSearchChanged.value, _currentPageIndex.value,
          _currentPageSize.value);
    }
  }

  void getContactAtPage(int pageIndex) {
    timer?.cancel();
    timer = Timer(Duration(seconds: delaySearch), () {
      printLog("Page Index: $pageIndex");
      onGoToPage(pageIndex);
    });
  }

  void onGoToPage(int pageIndex) {
    if (pageIndex != null &&
        pageIndex > 0 &&
        pageIndex <= _maxPageIndex.value) {
      _currentPageIndex.sink.add(pageIndex);
      getContactsList(onSearchChanged.value, _currentPageIndex.value,
          _currentPageSize.value);
    } else {
      _currentPageSize.sink.add(_currentPageSize.value);
      _currentPageIndex.sink.add(_currentPageIndex.value);
      getContactsList(onSearchChanged.value, _currentPageIndex.value,
          _currentPageSize.value);
    }
  }

  getContactsList(String searchKey, int pageIndex, int pageSize) async {
    if (searchKey == null || searchKey == "") {
      searchKey = defaultSearchKey;
    }
    _appState.sink.add(AppState.Loading);
    await appApiService.client
        .getAllContacts(searchKey, pageIndex, pageSize)
        .then((onValue) {
      if (onValue != null &&
          onValue.item?.listContacts != null &&
          onValue.item.listContacts.length > 0) {
        _contactsList.sink.add(onValue.item.listContacts);
        onContactListChanged(onValue.item.total);
        _totalContact.sink.add(onValue.item.total);
      }
      _appState.sink.add(AppState.Idle);
    });
  }

  onContactListChanged(int totalContact) {
    if (totalContact != null && totalContact > 0) {
      int kq = totalContact ~/ _currentPageSize.value;
      if (totalContact % _currentPageSize.value > 1) {
        _maxPageIndex.sink.add((kq + 1));
      } else {
        if (kq == 0) {
          _maxPageIndex.sink.add(defaultPageIndex);
        } else {
          _maxPageIndex.sink.add(kq);
        }
      }
    }
  }

  onShowingKeyBoard(bool isShowing) {
    _isShowingKeyBoard.sink.add(isShowing);
  }

  @override
  onChangedValue(String str) {
    printLog("OnChangedValue: " + str);
    return onSearchChanged.add(str);
  }

  @override
  onCompleted(String str) {
    printLog("OnCompeted: " + str);
  }

  Future<void> loadMoreContact() async {
    if ((_currentPageIndex.value + 1) > _maxPageIndex.value) {
      return;
    }
    _isLoadingMore.sink.add(true);
    _currentPageIndex.value += 1;
    _appState.sink.add(AppState.Loading);
    await appApiService.client
        .getAllContacts(mSearchKey, _currentPageIndex.value, defaultPageSize)
        .then((onValue) {
      if (onValue != null &&
          onValue.item?.listContacts != null &&
          onValue.item.listContacts.length > 0) {
        _contactsList.value.addAll(onValue.item.listContacts);
        _contactsList.sink.add(_contactsList.value);
        _totalContact.sink.add(onValue.item.total);
      }
      _appState.sink.add(AppState.Idle);
      _isLoadingMore.sink.add(false);
    }).catchError((onError) {
      _appState.sink.add(AppState.Idle);
      _isLoadingMore.sink.add(false);
    });
  }
}

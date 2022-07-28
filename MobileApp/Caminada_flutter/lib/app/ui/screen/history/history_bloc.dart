import 'dart:async';

import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/history_response.dart';
import 'package:caminada/app/model/remote/company_list_response.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/model/remote/filter_users_response.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:intl/intl.dart';
import 'package:rxdart/rxdart.dart';

import '../../../difinition.dart';

class HistoryBloc extends BlocBase {
  final BehaviorSubject<TotalSummary> _totalSumary =
      BehaviorSubject.seeded(null);
  Stream<TotalSummary> get totalSumary => _totalSumary.stream;

  final BehaviorSubject<bool> _isLoadingMore = BehaviorSubject.seeded(null);
  Stream<bool> get isLoadingMore => _isLoadingMore.stream;

  final BehaviorSubject<List<HistoryData>> _dataList =
      BehaviorSubject.seeded(null);

  final BehaviorSubject<DocumentTreeItem> _idDocumentItem =
      BehaviorSubject.seeded(null);
  Stream<DocumentTreeItem> get idDocumentItem => _idDocumentItem.stream;

  final BehaviorSubject<DateTime> _fromDate = BehaviorSubject();
  Stream<DateTime> get idfromDate => _fromDate.stream;
  final BehaviorSubject<DateTime> _toDate = BehaviorSubject();
  Stream<DateTime> get idtoDate => _toDate.stream;

  final BehaviorSubject<bool> _isFromDateActived =
      BehaviorSubject.seeded(false);
  Stream<bool> get isFromDateActived => _isFromDateActived.stream;

  final BehaviorSubject<IdLoginRoles> _loginRoles =
      BehaviorSubject.seeded(IdLoginRoles.User);
  Stream<IdLoginRoles> get loginRoles => _loginRoles.stream;

  final BehaviorSubject<List<UserItem>> _listUserFilter =
      BehaviorSubject.seeded([]);
  Stream<List<UserItem>> get listUserFilter => _listUserFilter.stream;

  final BehaviorSubject<CompanyItem> _companyItem =
      BehaviorSubject.seeded(null);
  Stream<CompanyItem> get companyItem => _companyItem.stream;
  final BehaviorSubject<List<CompanyItem>> _listCompany =
      BehaviorSubject.seeded([]);
  Stream<List<CompanyItem>> get listCompany => _listCompany.stream;

  final BehaviorSubject<String> _selectedUser = BehaviorSubject.seeded("");
  Stream<String> get selectedUser => _selectedUser.stream;

  int currentPageIndex = 0;
  int totalItem = 0;
  String currentFromDate = "";
  String currentToDate = "";
  String currentUserId = "";
  String currentCompany = "";
  String currentIdDocument = "";
  String selectedUserValue = "";

  Stream<List<HistoryData>> get dataList => _dataList.stream;
  DateTime get isformDate => _fromDate.value;

  String _userId = "";
  String _company = "";
  String _idDocument = "";
  int _defaultPageIndex = 0;
  int _defaultPageSize = 10;

  @override
  void dispose() {
    closeStream();
  }

  void closeStream() {
    _totalSumary?.close();
    _dataList?.close();
    _isLoadingMore?.close();
    _isFromDateActived?.close();
    _listUserFilter?.close();
    _companyItem?.close();
    _selectedUser?.close();
    _loginRoles?.close();
  }

  HistoryBloc() {
    getHistory('', '', _userId, _company, _idDocument, _defaultPageIndex,
        _defaultPageSize);
    getFilterOptionsByLoginRoles(
        CaminadaApplication.instance.getUserInfor().idLoginRoles);
  }

  void getFilterOptionsByLoginRoles(IdLoginRoles loginRoles) {
    switch (loginRoles) {
      case IdLoginRoles.MainAdministrator:
        _loginRoles.sink.add(IdLoginRoles.MainAdministrator);
        getListCompany();
        break;
      case IdLoginRoles.Administrator:
        _loginRoles.sink.add(IdLoginRoles.Administrator);
        break;
      default:
        break;
    }
  }

  void getListCompany() {
    appApiService.client.getListCompany().then((value) {
      if (value != null && value.companyList != null) {
        _listCompany.add(value.companyList);
      } else {
        _listCompany.add([]);
      }
    });
  }

  void selectedCompanyToFilter(CompanyItem company) {
    _company = company.idValue;
    currentCompany = company.idValue;
    _companyItem.sink.add(company);
  }

  selectUserToFilter(UserItem selectedItem) {
    if (selectedItem != null) {
      _userId = selectedItem.userId.toString();
      currentUserId = _userId;
      selectedUserValue = selectedItem.fullName;
    } else {
      resetFilterUser();
    }
  }

  Future<List<UserItem>> filterUserByKeyWords(String query) async {
    FilterUsersResponse filterUsersResponse =
        await appApiService.client.getListUserFilter(query);
    if (filterUsersResponse != null && filterUsersResponse.users != null) {
      _listUserFilter.sink.add(filterUsersResponse.users);
      return filterUsersResponse.users;
    } else {
      _listUserFilter.sink.add([]);
      return [];
    }
  }

  void resetFilterUser() {
    _userId = "";
    currentUserId = "";
    _listUserFilter.sink.add([]);
    _selectedUser.sink.add(null);
    selectedUserValue = "";
  }

  void getHistory(String fromDate, String toDate, String userId, String company,
      String idDocument, int pageIndex, int pageSize) {
    appApiService.client
        .getAllHistory(fromDate ?? '', toDate ?? '', userId ?? '',
            company ?? '', idDocument ?? '', pageIndex, pageSize)
        .then((value) {
      currentPageIndex = pageIndex;
      totalItem = value.item.totalResults;
      currentFromDate = fromDate;
      currentToDate = toDate;
      currentUserId = userId;
      currentCompany = company;
      currentIdDocument = idDocument;
      TotalSummary totalSummary = value.item.totalSummary;
      _totalSumary.sink.add(totalSummary);
      _dataList.sink.add(value.item.data);
    });
  }

  void filter() {
    _idDocument = _idDocumentItem.value?.data?.idDocumentTree?.toString();
    getHistory(
        _fromDate.value != null
            ? DateFormat("dd.MM.yyyy").format(_fromDate.value)
            : '',
        _toDate.value != null
            ? DateFormat("dd.MM.yyyy").format(_toDate.value)
            : '',
        _userId,
        _company,
        _idDocument,
        _defaultPageIndex,
        _defaultPageSize);
    _selectedUser.sink.add(selectedUserValue);
  }

  void resetFillter() {
    _userId = "";
    _company = "";
    _idDocument = "";
    currentPageIndex = 0;
    totalItem = 0;
    currentFromDate = "";
    currentToDate = "";
    currentUserId = "";
    currentCompany = "";
    currentIdDocument = "";
    selectedUserValue = "";
    _fromDate.sink.add(null);
    _toDate.sink.add(null);
    _idDocumentItem.sink.add(null);
    _isFromDateActived.sink.add(false);
    _listUserFilter.sink.add([]);
    _companyItem.sink.add(null);
    _selectedUser.sink.add('');
  }

  void getIdDocument(DocumentTreeItem idDoctree) {
    _idDocumentItem.sink.add(idDoctree);
  }

  void loadMoreHistory() {
    if (_defaultPageSize * currentPageIndex + _defaultPageSize > totalItem) {
      return;
    }
    _isLoadingMore.sink.add(true);
    currentPageIndex += 1;
    appApiService.client
        .getAllHistory(
            currentFromDate,
            currentToDate,
            currentUserId,
            currentCompany,
            currentIdDocument,
            currentPageIndex,
            _defaultPageSize)
        .then((value) {
      TotalSummary totalSummary = value.item.totalSummary;
      _totalSumary.sink.add(totalSummary);
      _dataList.value.addAll(value.item.data);
      _dataList.sink.add(_dataList.value);
      _isLoadingMore.sink.add(false);
    }).catchError((onError) {
      _isLoadingMore.sink.add(false);
    });
  }

  void selectDateTime(bool fromDate, DateTime dateTime) {
    fromDate ? _fromDate.sink.add(dateTime) : _toDate.sink.add(dateTime);
  }

  void setSelectFromDateClicked(bool value) {
    _isFromDateActived.sink.add(value);
  }
}

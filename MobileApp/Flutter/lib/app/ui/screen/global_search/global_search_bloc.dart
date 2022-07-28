import 'dart:async';

import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';
import 'package:xoonit/app/model/remote/global_search/get_summary_request.dart';
import 'package:xoonit/app/ui/component/appbar_top_component.dart';
import 'package:xoonit/core/bloc_base.dart';

class GlobalSearchBloc extends BlocBase implements AppBarSearchDelegate {

  BehaviorSubject<List<GlobalSearchModule>> _lsModule =
      BehaviorSubject<List<GlobalSearchModule>>();
  Stream<List<GlobalSearchModule>> get lsModule => _lsModule.stream;

  BehaviorSubject<GlobalSearchModule> _module =
      BehaviorSubject<GlobalSearchModule>();
  Stream<GlobalSearchModule> get module => _module.stream;

  BehaviorSubject<bool> _isSearching = BehaviorSubject<bool>.seeded(false);
  Stream<bool> get isSearching => _isSearching.stream;

  final searchOnChanedvalue = BehaviorSubject<String>.seeded("");

  @override
  void dispose() {
    _lsModule.close();
    _isSearching.close();
  }

  GlobalSearchBloc() {
    _getModules();
    searchOnChanedvalue.debounceTime(Duration(seconds: 1)).listen(_search);
  }

  _getModules() async {
    var response = await appApiService.client.getGlobalSearchModule();
    _lsModule.sink.add(response.item);
  }

  _search(String str) async {
    _isSearching.sink.add(true);
    var request = GlobalSearchSummaryRequest();
    request.keyword = str;
    // request.isWithStart = true;
    // request.searchWithStarPattern = "Both_*X*";
    request.indexes =
        "document,contact,maindocument,invoicepdm,contract,otherdocuments";

    var response =
        await appApiService.client.getGlobalSearchSummary(request.toJson());

    _lsModule.value.forEach((m) {
      m.count =
          response.item.firstWhere((i) => m.searchIndexKey == i.key)?.count ??
              0;
    });

    _lsModule.sink.add(_lsModule.value);
    _isSearching.sink.add(false);
  }

  @override
  onChangedValue(String str) => searchOnChanedvalue.add(str);
  
  @override
  onCompleted(String str) => null;
}

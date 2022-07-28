import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../model/history_response.dart';

class HistoryBloc extends BlocBase {
  final BehaviorSubject<List<HistoryItem>> _historyList =
      BehaviorSubject.seeded(null);
  Stream<List<HistoryItem>> get dataList => _historyList.stream;
  List<HistoryItem> _listItemDone = List();
  List<HistoryItem> _listItemUploading = List();
  List<HistoryItem> _listItemError = List();
  final BehaviorSubject<AppState> _appState =
      BehaviorSubject.seeded(AppState.Loading);

  Stream<AppState> get appState => _appState.stream;
  final BehaviorSubject<SyncStatus> _syncStatus =
      BehaviorSubject.seeded(SyncStatus.DONE);
  Stream<SyncStatus> get syncStatus => _syncStatus.stream;
  final BehaviorSubject<bool> _isLoading = BehaviorSubject.seeded(false);
  Stream<bool> get isLoading => _isLoading.stream;

  @override
  void dispose() {
    closeStream();
  }

  void closeStream() {
    _historyList?.close();
    _syncStatus?.close();
    _isLoading?.close();
    _appState?.close();
  }

  HistoryBloc() {
    getHistoryItem();
  }

  getHistoryItem() async {
    _appState.sink.add(AppState.Loading);
    _historyList.sink.add([]);
    _listItemDone.clear();
    _listItemUploading.clear();
    _listItemError.clear();
    await appApiService.client.getAllHistory().then((value) {
      if (value != null && value.item.data != null) {
        _listItemDone.clear();
        _listItemUploading.clear();
        _listItemError.clear();
        value.item.data.forEach((element) {
          switch (element.syncStatus) {
            case "Sync Ok":
              _listItemDone.add(element);
              break;
            case "Sync in progres..":
              _listItemUploading.add(element);
              break;
            default:
              _listItemError.add(element);
              break;
          }
        });
      }
    });
    getHistoryBySyncStatus(_syncStatus.value);
    _appState.sink.add(AppState.Idle);
  }

  void getHistoryBySyncStatus(SyncStatus syncStatus) {
    switch (syncStatus) {
      case SyncStatus.DONE:
        _syncStatus.sink.add(SyncStatus.DONE);
        _historyList.sink.add(_listItemDone);
        break;
      case SyncStatus.UPLOADING:
        _syncStatus.sink.add(SyncStatus.UPLOADING);
        _historyList.sink.add(_listItemUploading);
        break;
      default:
        _syncStatus.sink.add(SyncStatus.ERROR);
        _historyList.sink.add(_listItemError);
        break;
    }
  }
}

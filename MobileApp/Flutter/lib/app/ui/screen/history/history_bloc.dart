import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/core/bloc_base.dart';

class HistoryBloc extends BlocBase {
  @override
  void dispose() {}

  Future loadHistory() async {
    List<HistoryItem> listItem = new List();
    await appApiService.client.getAllHistory().then((onValue) {
      if (onValue?.item?.data != null) {
        listItem.addAll(onValue.item.data);
        return listItem;
      } else {
        return null;
      }
    }).timeout(Duration(seconds: 30));
    return listItem;
  }
}

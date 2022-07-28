import 'package:rxdart/subjects.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/get_main_language_response.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class EditLanguageBloc extends BlocBase {
  BehaviorSubject<List<MainLanguage>> _lsLanguage = BehaviorSubject.seeded([]);
  Stream<List<MainLanguage>> get lsLanguage => _lsLanguage.stream;
   

  @override
  void dispose() {
    _lsLanguage?.close();
  }

  EditLanguageBloc() {
    getMainLanguage();
  }

  Future<void> getMainLanguage() async {
    var response = await appApiService.client.getMainLanguage();
    if (response != null && response.item.data != null) {
      _lsLanguage.sink.add(response.item.data.last);
    }
  }

  void selectNewLanguage(String idRepLanguage) {
    XoonitApplication.instance.getUserInfor().idRepLanguage = idRepLanguage;
  }
  
  
}

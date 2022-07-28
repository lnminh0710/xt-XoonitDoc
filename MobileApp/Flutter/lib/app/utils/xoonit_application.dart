import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/model/user_info.dart';

class XoonitApplication {
  XoonitApplication._privateConstructor();

  UserInfo userInfo;

  List<DocumentTreeItem> _documentTreeItemList = List<DocumentTreeItem>();

  List<DocumentTreeItem> get documentTreeItemList => _documentTreeItemList;

  void setDocumentTreeList(List<DocumentTreeItem> documentTreeList) {
    _documentTreeItemList.clear();
    _documentTreeItemList.addAll(documentTreeList);
  }

  static final XoonitApplication _instance =
      XoonitApplication._privateConstructor();

  static XoonitApplication get instance {
    return _instance;
  }

  UserInfo getUserInfor() {
    return userInfo;
  }

  void setUserInfor(UserInfo userInfo) {
    this.userInfo = userInfo;
  }

  static SharedPreferences getSharePref() {
    return AppStateBloc.sharePref;
  }

  bool isUserLogin() {
    if (userInfo?.accessToken != null && userInfo?.accessToken != '') {
      return true;
    }
    return false;
  }
}

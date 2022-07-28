import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:caminada/app/app_state_bloc.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/model/user_info.dart';

class CaminadaApplication {
  CaminadaApplication._privateConstructor();

  UserInfo userInfo;

  List<DocumentTreeItem> _documentTreeItemList = List<DocumentTreeItem>();

  List<DocumentTreeItem> get documentTreeItemList => _documentTreeItemList;

  void setDocumentTreeList(List<DocumentTreeItem> documentTreeList) {
    _documentTreeItemList.clear();
    documentTreeList.forEach((element) {
      element.data.treeColor =
          Color.fromARGB(

        255, Random().nextInt(155) + 100, Random().nextInt(155) + 100, Random().nextInt(155) + 100);
    });
    _documentTreeItemList.addAll(documentTreeList);
  }

  static final CaminadaApplication _instance =
      CaminadaApplication._privateConstructor();

  static CaminadaApplication get instance {
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

  String getDocumentTreeNameById(int id) {
    String docName = "Unknow";

    _documentTreeItemList.forEach((element) {
      if (id == element.data.idDocumentTree) {
        docName = element.data.groupName;
        return;
      }
    });
    return docName;
  }

  DocumentTreeItem getDocumentTreeById(int id) {
    DocumentTreeItem documentTreeItem = DocumentTreeItem();

    _documentTreeItemList.forEach((element) {
      if (id == element.data.idDocumentTree) {
        documentTreeItem = element;
        return;
      }
    });
    return documentTreeItem;
  }
}

import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:toast/toast.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/ui/component/appbar_top_component.dart';
import 'package:xoonit/app/ui/dialog/dialog_structure_tree/dialog_structure_tree.dart';
import 'package:xoonit/app/ui/screen/home/home_enum.dart';
import 'package:xoonit/app/ui/screen/home/home_route.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class HomeBloc extends BlocBase {
  final BehaviorSubject<String> _screenName =
      BehaviorSubject.seeded(EHomeScreenChild.globalSearch.title);
  Stream<String> get screenName => _screenName.stream;

  final BehaviorSubject<EHomeScreenChild> _screenChild =
      BehaviorSubject.seeded(EHomeScreenChild.globalSearch);
  Stream<EHomeScreenChild> get screenChild => _screenChild.stream;

  final GlobalKey<NavigatorState> homeNavigatorKey = GlobalKey();

  BehaviorSubject<AppBarSearchDelegate> searchDelegate = BehaviorSubject();

  @override
  void dispose() {
    _screenName.close();
    _screenChild.close();
  }

  // jumpToScreen(EHomeScreenChild child, {Object arguments}) {
  // searchDelegate.add(null);
  // _screenName.sink.add(child.title);
  //   _screenChild.sink.add(child);
  // }

  jumpToScreen(EHomeScreenChild child, {String title, Object args}) {
    searchDelegate.add(null);
    _screenName.sink.add(title ?? child.title);
    homeNavigatorKey.currentState
        .pushReplacementNamed(child.routeName, arguments: args);
  }

  void openMyDMFolder(DocumentTreeItem documentTreeItem) {
    jumpToScreen(EHomeScreenChild.myDM,
        args: documentTreeItem.data.idDocumentTree);
    _screenName.sink.add(documentTreeItem.data.groupName);
  }

  Future<void> getDocumentTree() async {
    await appApiService.client.getDocumentTree().then((onValue) {
      if (onValue != null && onValue?.item != null)
        XoonitApplication.instance.setDocumentTreeList(onValue.item);
    });
  }

  void openDocumentTree(BuildContext context) {
    if (XoonitApplication.instance.documentTreeItemList.length > 0) {
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return StructureTreeDialog();
          }).then((onValue) {
        DocumentTreeItem documentTreeItem = onValue;
        if (documentTreeItem != null) {
          openMyDMFolder(documentTreeItem);
        }
      });
    } else {
      getDocumentTree().then((onValue) {
        if (XoonitApplication.instance.documentTreeItemList.length > 0) {
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return StructureTreeDialog();
              }).then((onValue) {
            DocumentTreeItem documentTreeItem = onValue;
            if (documentTreeItem != null) {
              openMyDMFolder(documentTreeItem);
            }
          });
        } else {
          Toast.show('Can\'t not get Document tree from server', context);
        }
      });
    }
  }
}

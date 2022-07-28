import 'dart:async';

import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/create_folder_request.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/ui/dialog/assign_document_popup.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/dialog/dialog_input_folder_name.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/ui/dialog/dialog_structure_tree/dialog_structure_tree.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/app/utils/navigator_extensions.dart';

class DashBoardBloc extends BlocBase {
  final BehaviorSubject<List<String>> _appbarTitles =
      BehaviorSubject.seeded(null);

  Stream<List<String>> get appbarTitles => _appbarTitles.stream;

  BehaviorSubject<AppState> _screenState =
      BehaviorSubject.seeded(AppState.Loading);
  Stream<AppState> get screenState => _screenState.stream;

  BehaviorSubject<bool> _enableBackButtonSubject = BehaviorSubject.seeded(true);
  Stream<bool> get enableBackButtonStream => _enableBackButtonSubject.stream;
  get isEnableBackButton => _enableBackButtonSubject.value;

  DashBoardBloc() {
    _appbarTitles.sink.add([EHomeScreenChild.home.title]);
    getDocumentTree();
    XoonitApplication.instance.getGlobalSearchController().getModules();
  }

  @override
  void dispose() {
    _appbarTitles?.close();
    _screenState?.close();
    _enableBackButtonSubject.close();
  }

  void setAppbarTitle(String title) {
    _appbarTitles.value.last = title;
    _appbarTitles.sink.add(_appbarTitles.value);
  }

  final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey();

  Future<void> getDocumentTree() async {
    await appApiService.client.getDocumentTree().then((onValue) {
      if (onValue != null && onValue?.item != null)
        onValue.item.forEach((element) {
          element.isMainFolder = true;
        });
      XoonitApplication.instance.setDocumentTreeList(onValue.item);
    });
  }

  Future<T> jumpToScreen<T extends Object>(EHomeScreenChild child,
      {String title, Object args}) async {
    if (EHomeScreenChild.camera.index == child.index) {
      await GeneralMethod.openCamera();
      return jumpToScreen(EHomeScreenChild.photos);
    } else {
      _appbarTitles.value.add(title??child.title);
      _appbarTitles.sink.add(_appbarTitles.value);
      return await appNavigatorKey.currentState
          .pushNamedIfNotCurrent(child.routeName, arguments: args);
    }
  }

//test commit
  void goBack({Object args}) {
    printLog(ModalRoute.of(appNavigatorKey.currentState.overlay.context)
        .settings
        .name);
    appNavigatorKey.currentState.pop();
    if (_appbarTitles.value.length > 0) {
      _appbarTitles.value.removeLast();
      _appbarTitles.sink.add(_appbarTitles.value);
    } else {
      _appbarTitles.sink.add([EHomeScreenChild.home.title]);
    }
  }

  Future<List<DocumentTreeItem>> checkGetDocumentTree() async {
    if (XoonitApplication.instance.documentTreeItemList.length <= 0) {
      await getDocumentTree();
    }
    return XoonitApplication.instance.documentTreeItemList;
  }

  void enableBackButton(bool isEnable) =>
      _enableBackButtonSubject.sink.add(isEnable);

  void openDocumentTree(BuildContext context) {
    if (XoonitApplication.instance.documentTreeItemList.length > 0) {
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return StructureTreeDialog();
          }).then((onValue) {
        DocumentTreeItem documentTreeItem = onValue;
        if (documentTreeItem != null) {
          // openMyDMFolder(documentTreeItem);
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
              // openMyDMFolder(documentTreeItem);
            }
          });
        } else {
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return DialogMessage(
                  title: 'Information',
                  message: 'Can\'t not get Document tree from server',
                  onOKButtonPressed: () {
                    Navigator.of(context).pop();
                  },
                );
              });
        }
      });
    }
  }

  void getCloudConnectionState(BuildContext context) async {
    _screenState.sink.add(AppState.Loading);
    var response = await appApiService.client.getCloudActives();
    var cloudActived = response.item.collectionData.firstWhere(
        (element) => element?.isActive?.value?.toLowerCase() == 'true',
        orElse: () => null);
    if (!(cloudActived != null &&
        cloudActived?.idCloudConnection?.value?.isNotEmpty == true)) {
      showDialog(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext _context) {
            return NotificationDialog(
              title: 'Notice !',
              message: 'You must connect to cloud',
              possitiveButtonName: "OK",
              possitiveButtonOnClick: (_) {
                Navigator.of(_context).pop();
                jumpToScreen(EHomeScreenChild.cloud);
                _enableBackButtonSubject.sink.add(false);
              },
              iconImages: Image.asset(Resources.icDialogWarning),
            );
          });
    }

    _screenState.sink.add(AppState.Idle);
  }

  void showCreateFolderPopup(BuildContext _context) {
    showDialog(
        context: _context,
        builder: (BuildContext mContext) {
          return SelectDocumentTreeDialog(
            isCreateFolder: true,
            titleDialog: "Create Folder",
          );
        }).then((value) {
      if (value is DocumentTreeItem) {
        _showInputNamePopup(value, _context);
      }
    });
  }

  void _showInputNamePopup(
      DocumentTreeItem _parentTree, BuildContext _context) {
    showDialog(
        context: _context,
        builder: (BuildContext mContext) {
          return DialogInputFolderName(
            parentName: _parentTree.data.groupName,
          );
        }).then((value) {
      if (value != null) {
        GeneralMethod.showDialogLoading(_context);
        appApiService.client
            .createFolder(CreateFolderRequest(
          idDocumentParent: _parentTree.data.idDocumentTree ?? null,
          idDocumentType: _parentTree.data.idRepDocumentGuiType ??
              ConstantValues.idDocumentTypeRoot,
          name: value,
          order: _parentTree?.children?.length != null
              ? _parentTree.children.length + 1
              : 0,
          hasChildren: false,
          isAfterAdjacentRoot: false,
        ).toJson())
            .then((onValue) {
          if (onValue != null && onValue.statusCode == 1) {
            getDocumentTree().then((value) {
              Navigator.of(_context).pop();
              _showSuccessDialog(_context);
            });
          } else {
            Navigator.of(_context).pop();
            _showErrorDialog(_context);
          }
        }).catchError((onError) {
          Navigator.of(_context).pop();
          _showErrorDialog(_context);
        });
      }
    });
  }

  void _showSuccessDialog(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext mContext) {
          return DialogMessage(
            title: 'Infomation',
            message: 'Create new folder successfully!',
            onOKButtonPressed: () {
              Navigator.of(mContext).pop();
              Navigator.of(context).pop();
            },
          );
        });
  }

  void _showErrorDialog(BuildContext context) {
    showDialog(
        context: context,
        builder: (BuildContext mContext) {
          return DialogMessage(
            title: 'Error',
            onOKButtonPressed: () {
              Navigator.of(mContext).pop();
              Navigator.of(context).pop();
            },
            message: 'Error when create a new folder. Please try later.',
          );
        });
  }
}
